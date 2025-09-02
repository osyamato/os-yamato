<template>
  <div class="chat-wrapper">
    <!-- タイトルとアイコン -->
    <div class="header">
      <h2 class="header-title">しりとり</h2>
      <div class="icon-button-group">
        <button
          class="icon-button"
          @click="showModeModal = true"
          :style="{ backgroundColor: iconColor, color: getTextColor(iconColor) }"
        >
          🎛️
        </button>
        <button
          class="icon-button"
          :style="{ backgroundColor: iconColor, color: getTextColor(iconColor) }"
          :class="{ 'rotate-once': isRotating }"
          @click="handleResetWithAnimation"
        >
          ↻
        </button>
      </div>
    </div>

    <!-- モード表示 -->
    <div class="selected-mode-wrapper">
      <span class="mode-note">現在のモード</span>
      <div class="mode-label-wrapper">
        <div class="mode-label">
          {{ selectedSpeedMode.label }} × {{ selectedGenreMode.label }}
        </div>
      </div>
      <span class="mode-note">🎛️から変更できるよ</span>
    </div>

    <!-- ステータスバー -->
    <div class="status-bar-container" v-if="!gameOver && timerStarted">
      <div class="status-bar" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- ゲーム開始ボタン -->
    <div v-if="history.length === 0 && !gameOver" class="start-screen">
      <button
        class="start-button"
        @click="startGame"
        :style="{ backgroundColor: iconColor, color: getTextColor(iconColor) }"
      >
        ▶️ ゲームを始める
      </button>
    </div>

    <!-- 入力欄 -->
    <div class="input-area">
      <input
        v-model="userInput"
        @keydown.enter.prevent="submitWord"
        :disabled="gameOver"
        placeholder="ひらがなを入力してね"
        autocomplete="off"
      />
    </div>

<!-- ゲームオーバー表示（入力欄の直下） -->
<div v-if="gameOver" class="gameover-wrapper">
  <div class="gameover-message" @animationend="showRestartHint = true">
    ⏰ ゲームオーバー
  </div>
  <div v-if="showRestartHint" class="restart-hint">
    ↻ からリスタートしてね
  </div>
</div>

    <!-- 会話履歴 -->
    <div class="message-list">
      <div
        v-for="(entry, index) in [...history].reverse()"
        :key="index"
        class="message-pair"
      >
        <div class="bot-message">
          🤖：
          <div v-if="entry.bot === '...'" class="gpt-dots-loader">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <span v-else>{{ entry.bot }}</span>
        </div>
        <div class="user-message" v-if="entry.user">
          あなた：{{ entry.user }}
        </div>
      </div>
    </div>

    <!-- モード選択モーダル -->
    <ModeSelectModal
      :visible="showModeModal"
      :icon-color="iconColor"
      @select="handleModeSelect"
      @close="showModeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ModeSelectModal from '@/components/ModeSelectModal.vue'
import { speedModes, genreModes } from '@/components/shiritoriModes.js'
import { wordPool } from '@/data/wordPool.js'
import { Auth } from 'aws-amplify'

const iconColor = ref('#274c77')
const showRestartHint = ref(false)

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
  } catch (e) {
    console.error('❌ アイコンカラー取得失敗:', e)
  }
})

// 🎨 文字色を動的に決定
function getTextColor(bg) {
  const darkColors = ['#274c77', '#14532d']
  return darkColors.includes(bg.toLowerCase()) ? 'white' : 'black'
}

// その他状態管理
const userInput = ref('')
const history = ref([])
const gameOver = ref(false)
const timerStarted = ref(false)
const progress = ref(0)
const showModeModal = ref(false)
const selectedSpeedKey = ref('ume')
const selectedGenreKey = ref('any')
const isRotating = ref(false)
let intervalId = null
let startTime = null

const selectedSpeedMode = computed(() => speedModes[selectedSpeedKey.value])
const selectedGenreMode = computed(() => genreModes[selectedGenreKey.value])
const TIMER_DURATION = computed(() => selectedSpeedMode.value.timeLimit)

function handleResetWithAnimation() {
  isRotating.value = true
  resetGame()
  setTimeout(() => {
    isRotating.value = false
  }, 500)
}

function handleModeSelect({ speed, genre }) {
  selectedSpeedKey.value = speed
  selectedGenreKey.value = genre
  showModeModal.value = false
  resetGame()
}

function startGame() {
  resetGame()
  const pool = wordPool[selectedGenreKey.value] || []
  const firstWord = pool[Math.floor(Math.random() * pool.length)] || 'ねこ'
  history.value.push({ user: '', bot: firstWord })
  startTimer()
}

function getLastChar(word) {
  const base = word.replace(/ー$/, '')
  const last = base.at(-1)
  const map = {
    'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う',
    'ぇ': 'え', 'ぉ': 'お'
  }
  return map[last] || last
}

function getBotReply(lastChar) {
  const pool = wordPool[selectedGenreKey.value] || []
  return pool.find(word => word.startsWith(lastChar)) || 'おわり'
}

function toHiragana(str) {
  return str.replace(/[\u30a1-\u30f6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  )
}

function startTimer() {
  clearInterval(intervalId)
  progress.value = 0
  startTime = Date.now()
  timerStarted.value = true

  intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime
    const percentage = Math.min(100, (elapsed / TIMER_DURATION.value) * 100)
    progress.value = percentage

    const bar = document.querySelector('.status-bar')
    if (bar) {
      bar.classList.toggle('warning', percentage >= 66)
    }

    if (elapsed >= TIMER_DURATION.value) {
      clearInterval(intervalId)
      gameOver.value = true
    }
  }, 100)
}

async function submitWord() {
  const input = toHiragana(userInput.value.trim())
  if (!input) return
  if (!/^[ぁ-んー]+$/.test(input)) {
    alert('ひらがなのみ入力してください')
    userInput.value = ''
    return
  }

  const previousEntry = history.value.at(-1)
  if (previousEntry) {
    const lastChar = getLastChar(previousEntry.bot)
    const firstChar = input[0]
    const mismatch = selectedSpeedMode.value.rules.allowSmallKanaMismatch
      ? getLastChar(firstChar) !== getLastChar(lastChar)
      : firstChar !== lastChar
    if (mismatch) {
      alert(`前の単語は「${previousEntry.bot}」なので、「${lastChar}」から始めてください`)
      return
    }
  }

  history.value.push({ user: input, bot: '...' })
  userInput.value = ''
  clearInterval(intervalId)
  timerStarted.value = false

  setTimeout(() => {
    const last = getLastChar(input)
    const bot = input.endsWith('ん')
      ? '「ん」で終わったので終了です！'
      : getBotReply(last)
    history.value[history.value.length - 1].bot = bot
    if (!bot || bot.includes('終了') || bot === 'おわり') {
      gameOver.value = true
    } else {
      startTimer()
    }
  }, 2000)
}

function resetGame() {
  userInput.value = ''
  history.value = []
  gameOver.value = false
  progress.value = 0
  timerStarted.value = false
  clearInterval(intervalId)
}

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}

/* ヘッダー */
.header {
  text-align: center;
  margin-bottom: 1rem;
}
.header-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.icon-button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.icon-button {
  border: none;
  border-radius: 50%;
  font-size: 1.4rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ステータスバー */
.status-bar-container {
  width: 100%;
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin: 0.5rem auto;
  max-width: 400px;
}
.status-bar {
  height: 12px;
  background-color: #274c77;
  transition: width 0.1s linear, background-color 0.3s ease;
  border-radius: 5px;
}
.status-bar.warning {
  background-color: #fca5a5;
}

/* 入力欄 */
.input-area {
  margin: 1rem auto;
  width: 100%;
  max-width: 280px; /* ← 横幅を少し小さく */
}

input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1.2rem;
  border-radius: 20px;
  border: 1px solid #ccc;
}

/* 会話履歴 */
.message-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 1rem;
  padding-bottom: 1rem;
}
.message-pair {
  text-align: center;
  margin-bottom: 1rem;
}
.user-message,
.bot-message {
  font-size: 1.2rem;
  margin: 0.3rem 0;
}

.gameover-wrapper {
  text-align: center;
  margin-top: 1rem;
}

.gameover-message {
  font-size: 1.4rem;
  color: crimson;
  font-weight: bold;
  animation: bounceDown 0.8s ease-out forwards;
}

.restart-hint {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #555;
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
  animation-delay: 0.2s;
}

@keyframes bounceDown {
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }
  60% {
    transform: translateY(20px);
    opacity: 1;
  }
  80% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}


/* ゲームスタートボタン */
.start-screen {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}
.start-button {
  border: none;
  border-radius: 9999px;
  font-size: 1.1rem;
  padding: 0.6rem 1.4rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.start-button:hover {
  opacity: 0.9;
}

/* ↻ 回転アニメ */
@keyframes rotate-once {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.rotate-once {
  animation: rotate-once 0.5s ease-in-out;
}

.selected-mode-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.mode-label-wrapper {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  width: 100%;
}

.mode-label {
  display: inline-block;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  background-color: #e0f2f1;
  color: #065f46;
  white-space: nowrap;
}

.mode-note {
  font-size: 0.9rem;
  color: #888;
  white-space: nowrap;
}

@media (prefers-color-scheme: dark) {
  .mode-label {
    background-color: #1f2937;
    color: #a7f3d0;
  }

  .mode-note {
    color: #ccc;
  }
}

</style>

