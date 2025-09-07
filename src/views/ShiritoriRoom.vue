<template>
  <div class="chat-wrapper">
    <div class="header header-animated">
      <h2 class="header-title">しりとり対戦</h2>
    </div>

    <div class="matching-timer" v-if="matching">
      マッチング中... {{ remainingSeconds }}秒
    </div>

    <div v-if="!matching && gameStarted" class="status-bar-container" v-show="timerVisible">
      <div class="status-bar" :style="{ width: `${progress}%` }"></div>
    </div>

    <div class="turn-status" v-if="gameStarted">
      <span v-if="isMyTurn">あなたの番です</span>
      <span v-else class="waiting">相手の番を待っています...</span>
    </div>

    <div class="input-area">
      <input
        v-model="inputWord"
        @keydown.enter="handleSubmit"
        :disabled="!isMyTurn || matching"
        placeholder="ひらがなを入力してね"
        autocomplete="off"
      />
    </div>

    <div class="message-list">
      <div
        v-for="(entry, index) in reversedHistory"
        :key="entry.id || index"
        class="message-pair"
      >
        <div v-if="entry.userId === 'typing'" class="bot-message gpt-dots-loader">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
        <div v-else-if="entry.userId === mySub" class="user-message">
          あなた：{{ entry.word }}
        </div>
        <div v-else class="bot-message">
          相手：{{ entry.word }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { getShiritoriRoom } from '@/graphql/queries'
import { onCreateTurn, onUpdateShiritoriRoom } from '@/graphql/subscriptions'
import { createTurn } from '@/graphql/mutations'
import { listTurns } from '@/graphql/queries'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id

const roomTitle = ref('')
const mySub = ref('')
const history = ref([])
const inputWord = ref('')
const gameStarted = ref(false)
const timerVisible = ref(false)
const progress = ref(0)
let gameTimer = null
const TIMER_DURATION = 10000

const typingIndicator = { id: 'typing', word: '...', userId: 'typing' }

// マッチング制御
const matching = ref(true)
const remainingSeconds = ref(180)
let matchingTimer = null
let roomSubscription = null
let turnSubscription = null

const sortedHistory = computed(() => [...history.value].sort((a, b) => a.order - b.order))
const reversedHistory = computed(() => [...sortedHistory.value].reverse())

const isMyTurn = computed(() => {
  const last = sortedHistory.value.at(-1)
  if (!last) return true
  if (last.userId === 'typing') return false
  return last.userId !== mySub.value
})

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  mySub.value = user.username

  await fetchRoom()
  startMatchingTimer()
  subscribeToRoomUpdates()
})

onUnmounted(() => {
  clearInterval(matchingTimer)
  stopGameTimer()
  roomSubscription?.unsubscribe()
  turnSubscription?.unsubscribe()
})

async function fetchRoom() {
  try {
    const res = await API.graphql(graphqlOperation(getShiritoriRoom, { id: roomId }))
    const room = res.data.getShiritoriRoom
    roomTitle.value = room.title

    if (room.guestId) {
      startGame()
    }
  } catch (e) {
    console.error('❌ ルーム取得失敗', e)
  }
}

function startMatchingTimer() {
  matchingTimer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      clearInterval(matchingTimer)
      router.push({ name: 'shiritori-match' })
    }
  }, 1000)
}

function subscribeToRoomUpdates() {
  roomSubscription = API.graphql(
    graphqlOperation(onUpdateShiritoriRoom)
  ).subscribe({
    next: ({ value }) => {
      const updatedRoom = value.data.onUpdateShiritoriRoom
      if (updatedRoom.id === roomId && updatedRoom.guestId) {
        clearInterval(matchingTimer)
        startGame()
      }
    },
    error: (err) => console.error('❌ サブスクリプション失敗', err)
  })
}

async function startGame() {
  matching.value = false
  gameStarted.value = true
  await fetchTurns()
  subscribeToTurns()
}

async function fetchTurns() {
  try {
    const res = await API.graphql(graphqlOperation(listTurns, {
      filter: { roomId: { eq: roomId } }
    }))
    history.value = res.data.listTurns.items
  } catch (e) {
    console.error('❌ ターン取得失敗', e)
  }
}

function subscribeToTurns() {
  turnSubscription = API.graphql(graphqlOperation(onCreateTurn)).subscribe({
    next: ({ value }) => {
      const newTurn = value.data.onCreateTurn
      if (newTurn.roomId !== roomId) return
      const exists = history.value.some(t => t.id === newTurn.id)
      if (!exists) {
        history.value = history.value.filter(t => t.id !== 'typing')
        history.value.push(newTurn)
        if (newTurn.userId !== mySub.value) startGameTimer()
      }
    },
    error: (err) => console.error('❌ onCreateTurn 失敗', err)
  })
}

// ⏱️ ゲームタイマー
function startGameTimer() {
  progress.value = 0
  stopGameTimer()
  timerVisible.value = true
  const start = Date.now()
  gameTimer = setInterval(() => {
    const elapsed = Date.now() - start
    progress.value = Math.min(100, (elapsed / TIMER_DURATION) * 100)
    if (elapsed >= TIMER_DURATION) stopGameTimer()
  }, 100)
}

function stopGameTimer() {
  clearInterval(gameTimer)
  timerVisible.value = false
}

const isSubmitting = ref(false)

async function handleSubmit() {
  if (!isMyTurn.value || isSubmitting.value) return
  const word = inputWord.value.trim()
  if (!word) return

  isSubmitting.value = true
  inputWord.value = ''

  try {
    const input = {
      roomId,
      userId: mySub.value,
      word,
      isValid: true,
      order: history.value.length
    }

    const res = await API.graphql(graphqlOperation(createTurn, { input }))
    const created = res.data.createTurn
    const exists = history.value.some(t => t.id === created.id)
    if (!exists) {
      history.value.push(created)
    }
    stopGameTimer()
    history.value.push(typingIndicator)
  } catch (e) {
    console.error('❌ 投稿失敗', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: 1rem;
  overflow: hidden;
}
.header {
  text-align: center;
  margin-bottom: 0.5rem;
}
.header-title {
  font-size: 1.6rem;
  font-weight: bold;
}
.matching-timer {
  text-align: center;
  font-size: 1rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}
.status-bar-container {
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin: 0.5rem auto;
  max-width: 400px;
  width: 100%;
}
.status-bar {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.1s linear;
}
.turn-status {
  text-align: center;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}
.waiting {
  color: #999;
}
.input-area {
  margin: 0 auto 1rem;
  max-width: 280px;
  width: 100%;
}
input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1.2rem;
  border-radius: 20px;
  border: 1px solid #ccc;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.message-pair {
  text-align: center;
}
.user-message {
  font-size: 1.2rem;
  color: #1e40af;
}
.bot-message {
  font-size: 1.2rem;
  color: #16a34a;
}
.gpt-dots-loader {
  display: flex;
  justify-content: center;
  gap: 5px;
}
.dot {
  width: 6px;
  height: 6px;
  background-color: #ccc;
  border-radius: 50%;
  animation: blink 1.4s infinite;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%, 80%, 100% { opacity: 0 }
  40% { opacity: 1 }
}
@media (prefers-color-scheme: dark) {
  input {
    background-color: #2e2e2e;
    color: #fff;
    border-color: #555;
  }
  .dot {
    background-color: #aaa;
  }
}
</style>
