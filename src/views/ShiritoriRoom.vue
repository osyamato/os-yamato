<template>
  <transition name="fade-out">
    <div v-if="!isFadingOut" class="chat-wrapper">
      <h2 class="header-title">しりとり対戦</h2>

      <!-- ⏳ マッチング待機中 -->
      <div v-if="!roomReady" class="waiting-room">
        <p>相手の参加を待っています...</p>
        <div class="status-bar-container">
          <div class="status-bar" :style="{ width: `${matchProgress}%` }"></div>
        </div>
        <p class="time-left">⏳ 残り {{ timeLeft }} 秒</p>
      </div>

      <!-- 🎮 ゲーム中 -->
      <div v-else>
        <!-- ⏱️ 入力タイマー -->
        <div class="turn-timer" v-if="isMyTurn && !isFirstTurn && !isGameOver">
          <!-- バー（上） -->
          <div class="progress-bar">
            <div
              class="progress"
              :class="{ warning: turnProgress <= 33 }"
              :style="{
                transform: `scaleX(${turnProgress / 100})`,
                transformOrigin: 'right'
              }"
            ></div>
          </div>
          <!-- 秒数（下） -->
          <p class="turn-countdown">
            ⏳ {{ turnTimeLeft }} 秒以内に入力
          </p>
        </div>

        <!-- 🔁 ターン状態 -->
        <div class="turn-status">
          <template v-if="shiritoriRoom?.isFinished">
            <span class="thank-you-message">🌸 相手にお礼の一言を伝えましょう</span>
          </template>
          <template v-else>
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
          </template>
        </div>

        <!-- ✏️ 入力欄 -->
        <div class="input-area">
          <input
            v-model="inputWord"
            @keydown.enter="handleSubmit"
            :disabled="isInputDisabled"
            placeholder="ひらがなを入力してね"
          />
          <div v-if="alertMessage" class="alert">{{ alertMessage }}</div>
        </div>

        <!-- 🌸 最後の一言 -->
        <div v-if="shiritoriRoom?.isFinished" class="final-messages">
          <p>最後の言葉</p>
          <p v-if="shiritoriRoom?.finalMessageHost">{{ shiritoriRoom.finalMessageHost }}</p>
          <p v-if="shiritoriRoom?.finalMessageGuest">{{ shiritoriRoom.finalMessageGuest }}</p>
        </div>

        <!-- 🏁 勝敗メッセージ -->
        <div v-if="showResultMessage" class="result-message">
          {{ showResultMessage }}
        </div>

        <!-- 💬 メッセージ履歴 -->
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
import { updateShiritoriRoom } from '@/graphql/mutations'


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
const usedWords = ref(new Set<string>())

const isHost = computed(() => mySub.value === shiritoriRoom.value?.hostId)
const isFirstTurn = computed(() => history.value.length === 0)
const sortedHistory = computed(() => [...history.value].sort((a, b) => a.order - b.order))
const lastChar = computed(() => {
  const lastTurn = sortedHistory.value.at(-1)
  return lastTurn?.word?.slice(-1) || null
})


const TURN_LIMIT = 10 // 秒
const turnTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const turnTimeLeft = ref(TURN_LIMIT)
const turnProgress = ref(100)

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
 markGameAsFinished() 
  }
})


const isInputDisabled = computed(() => {
  // ゲーム終了後は、すでに自分が一言を投稿済みなら入力無効
  if (shiritoriRoom.value?.isFinished) {
    return hasPostedFinalMessage.value
  }

  // ゲーム中は、自分の番でなければ無効
  return !isMyTurn.value
})


const isMyTurn = computed(() => {
  const lastTurn = sortedHistory.value.at(-1)
  if (!lastTurn) {
    return !isHost.value
  }
  return lastTurn.userId !== mySub.value
})


watch(isMyTurn, (newVal) => {
  if (newVal && !isFirstTurn.value && !isGameOver.value) {
    startTurnTimer()
  } else {
    stopTurnTimer()
  }
})

const reversedHistory = computed(() => [...sortedHistory.value].reverse())

const alertMessage = ref('')


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
  if (isSubmitting.value) return

  // ✅ 一言メッセージ投稿フェーズ（勝敗決定後、かつまだ投稿していない）
  if (shiritoriRoom.value?.isFinished && !hasPostedFinalMessage.value) {
    try {
      isSubmitting.value = true
      await submitFinalMessage(word)
      inputWord.value = ''
      alertMessage.value = '' // ← 一応リセット
    } catch (err) {
      console.error('一言送信失敗:', err)
      alertMessage.value = '送信に失敗しました'
    } finally {
      isSubmitting.value = false
    }
    return // 🛑 ここで終了、以降のターン処理はスキップ
  }

  // 通常のターン処理
  if (!roomReady.value || !isMyTurn.value) return

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
    stopTurnTimer()
    inputWord.value = ''
  } catch (err) {
    console.error('送信失敗:', err)
    alertMessage.value = '送信に失敗しました'
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

      // ❗重複ワードによる敗北判定
      if (usedWords.value.has(newTurn.word)) {
        if (newTurn.userId === mySub.value) {
          showResultMessage.value = 'あなたの負けです（重複）…💦'
        } else {
          showResultMessage.value = 'あなたの勝ちです！（相手が重複）🎉'
        }
        isGameOver.value = true
        markGameAsFinished() // ✅ ← ここを追加！
      } else {
        usedWords.value.add(newTurn.word)
      }

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

function startTurnTimer() {
  stopTurnTimer() // 既存のタイマーを止める
  turnTimeLeft.value = TURN_LIMIT
  turnProgress.value = 100

  const start = Date.now()
  turnTimer.value = setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000)
    turnTimeLeft.value = TURN_LIMIT - elapsed
    turnProgress.value = Math.max(0, ((TURN_LIMIT - elapsed) / TURN_LIMIT) * 100)

    if (elapsed >= TURN_LIMIT) {
      stopTurnTimer()
      showResultMessage.value = '時間切れ…あなたの負けです⏰'
      isGameOver.value = true
markGameAsFinished() 
    }
  }, 200)
}

function stopTurnTimer() {
  if (turnTimer.value) {
    clearInterval(turnTimer.value)
    turnTimer.value = null
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

async function markGameAsFinished() {
  if (!shiritoriRoom.value || !mySub.value) return

  const input: any = {
    id: shiritoriRoom.value.id,
    isFinished: true
    // finalMessageHost / finalMessageGuest は入力させるため空で送らない
  }

  try {
    await API.graphql(graphqlOperation(updateShiritoriRoom, { input }))
    console.log('✅ 終了状態を保存しました（メッセージは後で）')
  } catch (err) {
    console.error('❌ 終了状態の保存失敗:', err)
  }
}

const hasPostedFinalMessage = computed(() => {
  if (!shiritoriRoom.value) return true
  return isHost.value
    ? !!shiritoriRoom.value.finalMessageHost
    : !!shiritoriRoom.value.finalMessageGuest
})
async function submitFinalMessage(message: string) {
  const input: any = {
    id: shiritoriRoom.value.id
  }

  if (isHost.value) {
    input.finalMessageHost = message
  } else {
    input.finalMessageGuest = message
  }

  try {
    await API.graphql(graphqlOperation(updateShiritoriRoom, { input }))
    console.log('✅ 一言メッセージ送信完了')
  } catch (err) {
    console.error('❌ 一言送信失敗:', err)
  }
}

watch(() => shiritoriRoom.value?.isFinished, (finished) => {
  if (finished) {
    setTimeout(() => {
      fadeOutAndNavigate('shiritori-match')
    }, 20000)
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
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.turn-status .waiting {
  color: #888;
  font-style: italic;
}
.thank-you-message {
  font-size: 1rem;
  color: #16a34a;
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
  font-size: 1.2rem;     /* 👈 少し大きく */
  font-weight: 600;      /* 👈 強調 */
}

.bot-message {
  color: #16a34a;
  font-size: 1.2rem;     /* 👈 少し大きく */
  font-weight: 600;      /* 👈 強調 */
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

/* ✅ 修正: ターンタイマー構造対応 */
.turn-timer {
  margin: 1.2rem 0 0.5rem;
}
.turn-countdown {
  text-align: center;
  margin-top: 0.6rem;
  font-size: 0.95rem;
  color: #444;
}
@media (prefers-color-scheme: dark) {
  .turn-countdown {
    color: #ccc;
  }
}

.progress-bar {
  height: 8px;
  width: 100%;
  background: #ddd;
  border-radius: 4px;
  overflow: hidden;
}
@media (prefers-color-scheme: dark) {
  .progress-bar {
    background: #444;
  }
}

.progress {
  height: 100%;
  background: #93c5fd; /* 通常：淡い青 (blue-300) */
  transform-origin: right;
  transform: scaleX(1);
  transition: transform 1s linear, background-color 0.3s ease;
}
.progress.warning {
  background: #fca5a5; /* 残り1/3で警告色：rose-300 */
}

/* 🌸 勝敗後の一言メッセージ表示 */
.final-messages {
  margin-top: 2rem;
  padding: 1rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  animation: fadeIn 0.6s ease;
  text-align: center;
}
@media (prefers-color-scheme: dark) {
  .final-messages {
    background-color: rgba(30, 30, 30, 0.85);
    color: #eee;
  }
}
.final-messages h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
}
.final-message-content {
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 1rem;
}
.final-message-form {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
.final-message-form textarea {
  width: 80%;
  max-width: 400px;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.8rem;
  resize: none;
  min-height: 3.5rem;
  background: #fff;
  color: #000;
  text-align: center;
}
@media (prefers-color-scheme: dark) {
  .final-message-form textarea {
    background: #222;
    color: #fff;
    border: 1px solid #555;
  }
}

</style> 

