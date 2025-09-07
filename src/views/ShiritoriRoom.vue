<template>
 <transition name="fade-out">
    <div v-if="!isFadingOut" class="chat-wrapper">

  <div class="chat-wrapper">
    <h2 class="header-title">しりとり対戦</h2>

    <!-- ⏳ マッチング待機中 -->
    <div v-if="!roomReady" class="waiting-room">
      <p>相手の参加を待っています...</p>
      <div class="status-bar-container">
        <div class="status-bar" :style="{ width: `${matchProgress}%` }"></div>
      </div>
      <p class="time-left">⏳ 残り {{ timeLeft }} 秒</p>
    </div>

    <!-- 🎮 ゲーム開始後 -->
    <div v-else>
      <div class="turn-status">
        <template v-if="isFirstTurn">
          <template v-if="isMyTurn">
            <span>
              🎉 しりとりできる相手が見つかりました！<br />
              最初の一言を入力してください。<br />
              ゲームが始まります。
            </span>
          </template>
          <template v-else>
            <span class="waiting">
              🎉 しりとりできる相手が見つかりました！<br />
              相手の初手を待っています...
            </span>
          </template>
        </template>

        <template v-else>
          <template v-if="isMyTurn">
            <span>あなたの番です</span>
          </template>
          <template v-else>
            <span class="waiting">相手の番です...</span>
          </template>
        </template>
      </div>

<div class="input-area">
  <input
    v-model="inputWord"
    @keydown.enter="handleSubmit"
    :disabled="!isMyTurn"
    placeholder="ひらがなを入力してね"
  />
  <div v-if="alertMessage" class="alert">{{ alertMessage }}</div>
</div>

<div v-if="showResultMessage" class="result-message">
  {{ showResultMessage }}
</div>

      <div class="message-list">
        <div
          v-for="entry in reversedHistory"
          :key="entry.id"
          class="message-pair"
        >
          <div v-if="entry.userId === mySub" class="user-message">
            あなた：{{ entry.word }}
          </div>
          <div v-else class="bot-message">
            相手：{{ entry.word }}
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  </transition>

</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API, graphqlOperation } from 'aws-amplify'
import { getShiritoriRoom } from '@/graphql/queries'
import { deleteShiritoriRoom } from '@/graphql/mutations'
import { onUpdateShiritoriRoom } from '@/graphql/subscriptions'
import { onBeforeUnmount } from 'vue'
import { createTurn } from '@/graphql/mutations'
import { onCreateTurn } from '@/graphql/subscriptions'

const router = useRouter()
const route = useRoute()
const roomId = ref<string>('')
const showResultMessage = ref('')
const isGameOver = ref(false) //

const isFadingOut = ref(false)
const mySub = ref('')
const shiritoriRoom = ref<Record<string, any> | null>(null)
const matchTimer = ref<ReturnType<typeof setInterval> | null>(null)
const matchProgress = ref(0)
const timeLeft = ref(180)
const subscription = ref<any>(null)
const roomReady = ref(false)

const inputWord = ref('')
const history = ref<any[]>([])
const isSubmitting = ref(false)

const isHost = computed(() => mySub.value === shiritoriRoom.value?.hostId)
const isFirstTurn = computed(() => history.value.length === 0)
const sortedHistory = computed(() => [...history.value].sort((a, b) => a.order - b.order))
const lastChar = computed(() => {
  const lastTurn = sortedHistory.value.at(-1)
  return lastTurn?.word?.slice(-1) || null
})

watch(lastChar, (char) => {
  if (char === 'ん') {
    if (isMyTurn.value) {
      // 自分のターンで "ん" → 相手が「ん」で終わる語を言った → 自分の勝ち
      showResultMessage.value = 'あなたの勝ちです！🎉'
    } else {
      // 相手のターンで "ん" → 自分が「ん」で終わる語を言った → 自分の負け
      showResultMessage.value = 'あなたの負けです…💦'
    }
    isGameOver.value = true
  }
})

const reversedHistory = computed(() => [...sortedHistory.value].reverse())

const alertMessage = ref('')

const isMyTurn = computed(() => {
  const lastTurn = sortedHistory.value.at(-1)
  if (!lastTurn) {
    return !isHost.value
  }
  return lastTurn.userId !== mySub.value
})

onMounted(async () => {
  try {
    const user = await import('aws-amplify').then(m => m.Auth.currentAuthenticatedUser())
    mySub.value = user.attributes.sub

    roomId.value = route.params.id as string

    const res = await API.graphql(graphqlOperation(getShiritoriRoom, { id: roomId.value }))
    shiritoriRoom.value = res.data.getShiritoriRoom

    subscribeToRoom(roomId.value)

    if (isHost.value) {
      startMatchTimer()
    } else {
      roomReady.value = !!shiritoriRoom.value?.hostId
    }

    // ✅ どちらもリアルタイム更新を受け取るために追加
    subscribeToTurns(roomId.value)

  } catch (err) {
    console.error('初期化エラー:', err)
  }
})

watch(() => shiritoriRoom.value?.guestId, (newGuestId) => {
  if (newGuestId && !roomReady.value) {
    roomReady.value = true
  }
})

onUnmounted(() => {
  stopMatchTimer()
  subscription.value?.unsubscribe?.()
})

function fadeOutAndNavigate(path: string) {
  isFadingOut.value = true
  setTimeout(() => {
    router.push({ name: path })
  }, 800)
}

async function handleSubmit() {
  const word = inputWord.value.trim()
  if (!word) return
  if (!roomReady.value || !isMyTurn.value || isSubmitting.value) return

  // ✅ 前の文字との比較（1ターン目はスキップ）
  if (!isFirstTurn.value && lastChar.value && word[0] !== lastChar.value) {
    alertMessage.value = `「${lastChar.value}」から始まる言葉を入力してください`
    return
  }

  alertMessage.value = ''
  isSubmitting.value = true

  try {
    const input = {
      roomId: roomId.value,
      userId: mySub.value,
      word,
      order: history.value.length,
      isValid: true
    }

    await API.graphql(graphqlOperation(createTurn, { input }))

    inputWord.value = ''
  } catch (err) {
    console.error('送信失敗:', err)
  } finally {
    isSubmitting.value = false
  }
}

function subscribeToTurns(roomId: string) {
  API.graphql(graphqlOperation(onCreateTurn)).subscribe({
    next: ({ value }: any) => {
      const newTurn = value.data.onCreateTurn
      if (newTurn.roomId !== roomId) return

      // 重複チェック（すでにIDが存在するか）
      if (history.value.find(t => t.id === newTurn.id)) return

      history.value.push(newTurn)
      history.value.sort((a, b) => a.order - b.order)
    },
    error: (err: any) => {
      console.error('ターンサブスクリプションエラー:', err)
    }
  })
}

function subscribeToRoom(roomId: string) {
  subscription.value = API.graphql(graphqlOperation(onUpdateShiritoriRoom)).subscribe({
    next: ({ value }: any) => {
      const updatedRoom = value.data.onUpdateShiritoriRoom
      if (updatedRoom.id !== roomId) return

      shiritoriRoom.value = updatedRoom

      if (updatedRoom.guestId && updatedRoom.hostId) {
        roomReady.value = true
      }
    },
    error: (err: any) => {
      console.error('サブスクリプションエラー:', err)
    }
  })
}

function startMatchTimer() {
  const DURATION = 180_000
  const start = Date.now()
  matchProgress.value = 0
  timeLeft.value = DURATION / 1000

  matchTimer.value = setInterval(async () => {
    const elapsed = Date.now() - start
    const remaining = Math.ceil((DURATION - elapsed) / 1000)

    matchProgress.value = Math.min(100, (elapsed / DURATION) * 100)
    timeLeft.value = Math.max(0, remaining)

    if (elapsed >= DURATION) {
      stopMatchTimer()

      if (
        shiritoriRoom.value &&
        shiritoriRoom.value.hostId === mySub.value &&
        !shiritoriRoom.value.guestId
      ) {
        try {
          await API.graphql(graphqlOperation(deleteShiritoriRoom, {
            input: { id: shiritoriRoom.value.id }
          }))
          console.log('🗑️ ルーム削除成功')
        } catch (err) {
          console.error('❌ ルーム削除失敗', err)
        }
      }

      fadeOutAndNavigate('shiritori-match')
    }
  }, 200)
}

function stopMatchTimer() {
  if (matchTimer.value) {
    clearInterval(matchTimer.value)
    matchTimer.value = null
  }
}
onBeforeUnmount(async () => {
  if (roomId.value) {
    try {
      await API.graphql(graphqlOperation(deleteShiritoriRoom, {
        input: { id: roomId.value }
      }))
      console.log('🗑️ 離脱によりルーム削除（常に削除）')
    } catch (err) {
      console.error('ルーム削除失敗', err)
    }
  }
})


</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: 1rem;
}

.header-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.status-bar-container {
  height: 10px;
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin: 1rem 0;
}
.status-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.2s linear;
}

.turn-status {
  text-align: center;
  margin: 0.5rem 0 1rem;
  font-size: 0.95rem;
}

.input-area {
  max-width: 300px;
  margin: 0 auto 1rem;
}
input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1.1rem;
  border-radius: 20px;
  border: 1px solid #ccc;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
}
.message-pair {
  text-align: center;
}
.user-message {
  color: #1e40af;
}
.bot-message {
  color: #16a34a;
}
.turn-status {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.turn-status .waiting {
  color: #888;
  font-style: italic;
}

.time-left {
  text-align: center;
  font-size: 0.95rem;
  color: #555;
  margin-top: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .time-left {
    color: #ccc;
  }
}

.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 0.8s ease;
}
.fade-out-enter-from,
.fade-out-leave-to {
  opacity: 0;
}
.alert {
  margin-top: 0.5rem;
  color: #dc2626;
  font-size: 0.9rem;
  text-align: center;
}

.result-message {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #e11d48;
  margin-top: 1rem;
}

</style> 

