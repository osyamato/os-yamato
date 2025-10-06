<template>
  <div class="chat-wrapper">
    <!-- タイトルとアイコン -->
<div class="header header-animated">
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

<button
  class="icon-button"
  @click="goToMatchView"
  :style="{ backgroundColor: iconColor, color: getTextColor(iconColor) }"
>
  👥
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

<div v-if="gameOver" class="gameover-wrapper">
  <div
    class="gameover-message"
    @animationend="showRestartHint = true"
  >
    {{ playerWin ? '🎉 あなたの勝ち！' : '⏰ ゲームオーバー' }}
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
import { useRouter } from 'vue-router'

// 状態
const iconColor = ref('#274c77')
const showRestartHint = ref(false)
const userInput = ref('')
const history = ref([])
const gameOver = ref(false)
const playerWin = ref(false)
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


const router = useRouter()


function goToMatchView() {
  router.push({ name: 'shiritori-match' })
}

// 🌈 ユーザー情報
onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
  } catch (e) {
    console.error('❌ アイコンカラー取得失敗:', e)
  }
})

function getTextColor(bg) {
  const darkColors = ['#274c77', '#14532d']
  return darkColors.includes(bg.toLowerCase()) ? 'white' : 'black'
}

function getLastValidBotWord() {
  for (let i = history.value.length - 1; i >= 0; i--) {
    const bot = history.value[i].bot
    if (
      bot &&
      bot !== '...' &&
      !bot.includes('じゃないみたい') &&
      !bot.includes('で始めてね') && // ← ここ追加
      !bot.includes('まいりました') && // bot降参時
      /^[ぁ-んー]+$/.test(bot)           // ← ひらがなのみ
    ) {
      return bot
    }
  }
  return null
}

// 🔁 リセットやモード変更
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

// 🎮 ゲーム開始
function startGame() {
  resetGame()
  const pool = wordPool[selectedGenreKey.value] || []
  const firstWord = pool[Math.floor(Math.random() * pool.length)] || 'ねこ'
  history.value.push({ user: '', bot: firstWord })
  startTimer()
}

// ⏱️ タイマー処理
function startTimer() {
  clearInterval(intervalId)
  progress.value = 0
  startTime = Date.now()
  timerStarted.value = true

  intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime
    progress.value = Math.min(100, (elapsed / TIMER_DURATION.value) * 100)
    if (elapsed >= TIMER_DURATION.value) {
      clearInterval(intervalId)
      gameOver.value = true
    }
  }, 100)
}

// 🔤 小文字→通常文字処理
function getLastChar(word) {
  if (!word || typeof word !== 'string') return ''
  const base = word.replace(/ー$/, '')
  const last = base.at(-1)
  const map = {
    'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う',
    'ぇ': 'え', 'ぉ': 'お'
  }
  return map[last] || last
}

// 📛 カタカナ→ひらがな
function toHiragana(str) {
  return str.replace(/[\u30a1-\u30f6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  )
}

function getBotReply(lastChar) {
  const pool = wordPool[selectedGenreKey.value] || []
  const usedWords = history.value.flatMap(entry => [entry.user, entry.bot])
  const candidates = pool.filter(
    word => word.startsWith(lastChar) && !usedWords.includes(word)
  )
  return candidates[0] || null
}


// 📡 GPT ジャンル判定
async function validateWithGPT(word, genreKey) {
  const genreLabel = genreModes[genreKey]?.label || genreKey
  try {
    const res = await fetch('https://tfxc3pudv4.execute-api.ap-northeast-1.amazonaws.com/Yamato_GPT_mini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `ユーザーが入力した単語が「${genreLabel}」のジャンル（例：動物、食べ物など）に該当するか判定してください。`
          },
          {
            role: 'user',
            content: `単語：「${word}」\nジャンル：「${genreLabel}」\nこの単語は該当しますか？はい/いいえで答えてください。`
          }
        ],
        mode: 'factual',
        language: 'ja'
      })
    })
    const data = await res.json()
    return data.text?.includes('はい') || false
  } catch (e) {
    console.error('❌ GPT 判定失敗:', e)
    return false
  }
}

async function submitWord() {
  const input = toHiragana(userInput.value.trim())
  if (!input) return

  // ✅ ひらがなチェック
  if (!/^[ぁ-んー]+$/.test(input)) {
    history.value.push({ user: input, bot: 'ひらがなのみ入力してね' })
    userInput.value = ''
    return
  }

  // ✅ 「ん」で終わったら即終了（最優先チェック）
  if (input.endsWith('ん')) {
    history.value.push({ user: input, bot: '「ん」で終わったので終了です！' })
    gameOver.value = true
    return
  }

  // ✅ botの直前ワードと接続チェック
  const previousBot = getLastValidBotWord()
  if (previousBot) {
    const lastChar = getLastChar(previousBot)
    const firstChar = input[0]
    const mismatch = selectedSpeedMode.value.rules.allowSmallKanaMismatch
      ? getLastChar(firstChar) !== getLastChar(lastChar)
      : firstChar !== lastChar

    if (mismatch) {
      history.value.push({ user: input, bot: `「${previousBot}」のあとだから、「${lastChar}」で始めてね！` })
      return
    }
  }

  // ✅ 重複チェック
  const allUsedWords = history.value.flatMap(entry => [entry.user, entry.bot])
  if (allUsedWords.includes(input)) {
    history.value.push({ user: input, bot: `「${input}」はすでに使われました！ゲームオーバーです。` })
    gameOver.value = true
    return
  }

  // ✅ 入力を記録、bot「...」で考え中表示
  history.value.push({ user: input, bot: '...' })
  userInput.value = ''
  clearInterval(intervalId)
  timerStarted.value = false

  // ✅ 少し待って bot 応答
  setTimeout(async () => {
    let botResponse = ''
    const last = getLastChar(input)
    const pool = wordPool[selectedGenreKey.value] || []

    // ✅ ジャンルチェック（any 以外 & 手動辞書に未登録）
    if (selectedGenreKey.value !== 'any' && !pool.includes(input)) {
      const isValid = await validateWithGPT(input, selectedGenreKey.value)
      if (!isValid) {
        botResponse = `「${input}」は「${selectedGenreMode.value.label}」じゃないみたい...🥺`
        history.value[history.value.length - 1].bot = botResponse
        if (history.value.length > 1) startTimer()
        return
      }
    }

    // ✅ bot の返答候補から、未使用かつ接続できるワードを選定
    const candidate = pool.find(word =>
      word.startsWith(last) && !allUsedWords.includes(word)
    )

    if (!candidate) {
      botResponse = 'まいりました🥺'
      gameOver.value = true
      playerWin.value = true
    } else {
      botResponse = candidate
      startTimer()
    }

    // ✅ bot の返答を反映
    history.value[history.value.length - 1].bot = botResponse
  }, 800)
}


// 🔄 リセット
function resetGame() {
  userInput.value = ''
  history.value = []
  gameOver.value = false
  playerWin.value = false
  progress.value = 0
  timerStarted.value = false
  clearInterval(intervalId)
}

// クリーンアップ
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
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
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

@media (prefers-color-scheme: dark) {
  input {
    background-color: #333;
    color: #fff;
    border: 1px solid #555;
  }
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
  color: #fca5a5; /* ← 淡い赤（tailwind の rose-300 相当） */
  background: none;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0;
  border: none;
}

.mode-note {
  font-size: 0.9rem;
  color: #888;
  white-space: nowrap;
  letter-spacing: -0.5px; /* 👈 追加 */
}

@media (prefers-color-scheme: dark) {
  .mode-label {
    color: #fca5a5;  /* ← ここも同じ色で統一 */
    background: none !important;
  }
}

@keyframes fadeSlideDown {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-animated {
  animation: fadeSlideDown 0.6s ease-out;
}

</style>

