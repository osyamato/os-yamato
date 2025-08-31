<template>
  <div class="chat-wrapper">
    <!-- タイトルとアイコン -->
    <div class="header">
      <h2 class="header-title">しりとり</h2>
      <div class="icon-button-group">
        <button class="icon-button" @click="showModeModal = true">🌱</button>
<button
  class="icon-button"
  :class="{ 'rotate-once': isRotating }"
  @click="handleResetWithAnimation"
>↻</button>
        <button class="icon-button">🌸</button>
      </div>
    </div>

<div class="selected-mode-display">
  <div class="mode-label">
    {{ selectedSpeedMode.emoji }} {{ selectedSpeedMode.label }}
    ×
    {{ selectedGenreMode.emoji }} {{ selectedGenreMode.label }}
  </div>
</div>

    <!-- ステータスバー -->
    <div class="status-bar-container" v-if="!gameOver && timerStarted">
      <div class="status-bar" :style="{ width: `${progress}%` }"></div>
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

    <!-- 会話履歴（最新が上） -->
    <div class="message-list">
      <div v-for="(entry, index) in [...history].reverse()" :key="index" class="message-pair">
        <div class="bot-message">
          Bot：
          <div v-if="entry.bot === '...'" class="gpt-dots-loader">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <span v-else>{{ entry.bot }}</span>
        </div>
        <div class="user-message">あなた：{{ entry.user }}</div>
      </div>
      <div v-if="gameOver" class="gameover-message">⏰ ゲームオーバー</div>
    </div>

    <ModeSelectModal
      :visible="showModeModal"
      @select="handleModeSelect"
      @close="showModeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import ModeSelectModal from '@/components/ModeSelectModal.vue'
import { speedModes, genreModes } from '@/components/shiritoriModes.js'
import { wordPool } from '@/data/wordPool.js'

// 入力・状態管理
const userInput = ref('')
const history = ref([])
const gameOver = ref(false)
const timerStarted = ref(false)
const progress = ref(0)
let intervalId = null
let startTime = null

// モード選択状態
const selectedSpeedKey = ref('ume')
const selectedGenreKey = ref('any')
const showModeModal = ref(false)

const selectedSpeedMode = computed(() => speedModes[selectedSpeedKey.value])
const selectedGenreMode = computed(() => genreModes[selectedGenreKey.value])
const TIMER_DURATION = computed(() => selectedSpeedMode.value.timeLimit)


const isRotating = ref(false)

function handleResetWithAnimation() {
  isRotating.value = true
  resetGame()

  // 一度だけ回転 → クラス削除
  setTimeout(() => {
    isRotating.value = false
  }, 500) // アニメ時間と一致
}

// モード変更
function handleModeSelect({ speed, genre }) {
  selectedSpeedKey.value = speed
  selectedGenreKey.value = genre
  showModeModal.value = false
}

// カタカナ→ひらがな変換
function toHiragana(str) {
  return str.replace(/[\u30a1-\u30f6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  )
}

// 小文字補正して最後の文字を取得
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

// Botの返答
function getBotReply(lastChar) {
  const pool = wordPool[selectedGenreKey.value] || []
  return pool.find(word => word.startsWith(lastChar)) || 'おわり'
}

// GPT mini でジャンル判定
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
      if (percentage >= 66) {
        bar.classList.add('warning')
      } else {
        bar.classList.remove('warning')
      }
    }

    if (elapsed >= TIMER_DURATION.value) {
      clearInterval(intervalId)
      gameOver.value = true
    }
  }, 100)
}

async function submitWord() {
  const input = toHiragana(userInput.value.trim())

  // 🔕 入力なしなら処理スキップ（アラートなし）
  if (!input) return

  // ⚠️ ひらがな以外が含まれる場合：アラート → 入力クリア
  if (!/^[ぁ-んー]+$/.test(input)) {
    alert('ひらがなのみ入力してください')
    userInput.value = ''
    return
  }

  // 📌 前の単語と接続チェック（しりとり）
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

  // ⏳ アニメーション表示 & タイマー停止
  history.value.push({ user: input, bot: '...' })
  userInput.value = ''
  clearInterval(intervalId)
  timerStarted.value = false

  // ✅ ジャンルチェック（DB → GPT）
  const pool = wordPool[selectedGenreKey.value] || []
  if (selectedGenreKey.value !== 'any' && !pool.includes(input)) {
    const isValid = await validateWithGPT(input, selectedGenreKey.value)

    if (!isValid) {
      history.value[history.value.length - 1].bot = `「${input}」は「${selectedGenreMode.value.label}」ジャンルでは使えません`

      // ⏱ 2秒後に削除＆タイマー再開
      setTimeout(() => {
        history.value.pop()
        startTimer()
      }, 2000)

      return
    }
  }

  // 🤖 Bot 応答処理（2秒遅延）
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

// リセット処理
function resetGame() {
  userInput.value = ''
  history.value = []
  gameOver.value = false
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
:root {
  --text-color: #000;
}
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #fff;
  }
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
  color: var(--text-color);
}

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
  background-color: #14532d;
  color: #fff;
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

.status-bar-container {
  width: 100%;
  height: 10px; /* ← 高さを6px→10pxに */
  background-color: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin: 0.5rem auto;
  max-width: 400px;
}

.status-bar {
  height: 12px; /* ← 少し太くしました */
  background-color: #274c77;
  transition: width 0.1s linear, background-color 0.3s ease;
  border-radius: 5px;
}

.status-bar.warning {
  background-color: #fca5a5; /* 淡い赤色 */
}

/* 入力欄 */
.input-area {
  margin: 1rem auto;
  width: 100%;
  max-width: 400px;
}
input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1.2rem;
  border-radius: 20px;
  border: 1px solid #ccc;
  background: #fff;
  color: #000;
}
@media (prefers-color-scheme: dark) {
  input {
    background: #222;
    border-color: #555;
    color: #fff;
  }
}

/* 履歴表示 */
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
  color: var(--text-color);
}

.gameover-message {
  text-align: center;
  font-size: 1.4rem;
  color: crimson;
  margin-top: 1rem;
  font-weight: bold;
}

/* GPT風ドットアニメーション */
.gpt-dots-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
}
.gpt-dots-loader .dot {
  width: 6px;
  height: 6px;
  margin: 0 4px;
  background-color: var(--text-color);
  border-radius: 50%;
  opacity: 0.4;
  animation: dot-flash 1.6s infinite ease-in-out both;
}
.gpt-dots-loader .dot:nth-child(1) { animation-delay: 0s; }
.gpt-dots-loader .dot:nth-child(2) { animation-delay: 0.2s; }
.gpt-dots-loader .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-flash {
  0%, 80%, 100% { opacity: 0.4; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-6px); }
}

.selected-mode-display {
  text-align: center;
  margin-bottom: 1rem;
}
.mode-label {
  display: inline-block;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  background-color: #e0f2f1;
  color: #065f46;
}
@media (prefers-color-scheme: dark) {
  .mode-label {
    background-color: #1f2937;
    color: #a7f3d0;
  }
}

@keyframes rotate-once {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.rotate-once {
  animation: rotate-once 0.5s ease-in-out;
}

</style>

