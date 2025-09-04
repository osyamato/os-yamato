<template>
  <div class="shiritori-room">
    <h2 class="room-title">📝 {{ roomTitle }}</h2>

    <!-- 相手とのしりとり履歴 -->
    <div class="shiritori-history">
      <div
        v-for="(entry, index) in sortedHistory"
        :key="entry.id || index"
        class="entry"
      >
        <div v-if="entry.userId === mySub" class="player-word">👤 {{ entry.word }}</div>
        <div v-else class="opponent-word">🧑 {{ entry.word }}</div>
      </div>
    </div>

    <!-- 入力欄 -->
    <div class="input-area">
      <input
        v-model="inputWord"
        class="shiritori-input"
        :placeholder="t('shiritori.placeholder')"
        @keydown.enter="handleSubmit"
        :disabled="!isMyTurn"
      />
      <button @click="handleSubmit" class="submit-button" :disabled="!isMyTurn">
        ⇧
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'

import { listTurns } from '@/graphql/queries'
import { getShiritoriRoom } from '@/graphql/queries'
import { createTurn } from '@/graphql/mutations'
import { onCreateTurn } from '@/graphql/subscriptions'

const { t } = useI18n()
const route = useRoute()
const roomId = route.params.id

const roomTitle = ref('')
const history = ref([])
const inputWord = ref('')
const mySub = ref('')
const roomData = ref(null)

const sortedHistory = computed(() =>
  [...history.value].sort((a, b) => a.order - b.order)
)

const isMyTurn = computed(() => {
  const last = sortedHistory.value.at(-1)
  if (!last) return true // 先攻
  return last.userId !== mySub.value
})

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  mySub.value = user.username

  try {
    const roomRes = await API.graphql(graphqlOperation(getShiritoriRoom, { id: roomId }))
    roomData.value = roomRes.data.getShiritoriRoom
    roomTitle.value = roomData.value.title

    const turnRes = await API.graphql(graphqlOperation(listTurns, {
      filter: { roomId: { eq: roomId } },
    }))
    history.value = turnRes.data.listTurns.items
  } catch (e) {
    console.error('❌ 初期取得エラー', e)
  }

  // ✅ リアルタイム購読開始
  const sub = API.graphql(graphqlOperation(onCreateTurn)).subscribe({
    next: ({ value }) => {
      const newTurn = value.data.onCreateTurn
      if (newTurn.roomId === roomId && newTurn.userId !== mySub.value) {
        history.value.push(newTurn)
      }
    },
    error: (err) => console.error('❌ サブスクリプション失敗', err),
  })

  onUnmounted(() => {
    sub.unsubscribe()
  })
})

const handleSubmit = async () => {
  const word = inputWord.value.trim()
  if (!word) return

  try {
    const input = {
      roomId,
      userId: mySub.value,
      word,
      isValid: true,
      order: history.value.length,
    }

    const res = await API.graphql(graphqlOperation(createTurn, { input }))
    history.value.push(res.data.createTurn)
    inputWord.value = ''
  } catch (e) {
    console.error('❌ 単語送信失敗', e)
  }
}
</script>

<style scoped>
.shiritori-room {
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
}

.room-title {
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.shiritori-history {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  background-color: #fafafa;
}

.entry {
  margin: 0.4rem 0;
}

.player-word {
  text-align: right;
  color: #1e40af;
}

.opponent-word {
  text-align: left;
  color: #16a34a;
}

.input-area {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.shiritori-input {
  width: 60%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button {
  padding: 0.6rem 1rem;
  background-color: #2b8df6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .shiritori-history {
    background-color: #1e1e1e;
    border-color: #444;
  }
  .shiritori-input {
    background-color: #2e2e2e;
    color: #fff;
    border-color: #555;
  }
}
</style>

