<template>
  <div class="chat-wrapper">
    <!-- タイトルとアイコン -->
    <div class="header">
      <h2 class="header-title">しりとり</h2>
      <div class="icon-button-group">
        <button class="icon-button" @click="showModeModal = true">🌱</button>
        <button class="icon-button" @click="resetGame">🌀</button>
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
import { wordPool } from '@/data/wordPool.js' // ← 🍙 追加ポイント！

// 入力・状態管理
const userInput = ref('')
const history = ref([])
const gameOver = ref(false)
const timerStarted = ref(false)
const progress = ref(0)
let intervalId = null
let startTime = null

// モード選択状態
const selectedSpeedKey = ref('ume')     // 初期値：梅（ゆったり）
const selectedGenreKey = ref('any')     // 初期値：ジャンル制限なし
const showModeModal = ref(false)

// モードの詳細（ラベル・ルール取得などに使う）
const selectedSpeedMode = computed(() => speedModes[selectedSpeedKey.value])
const selectedGenreMode = computed(() => genreModes[selectedGenreKey.value])
const TIMER_DURATION = computed(() => selectedSpeedMode.value.timeLimit)

// モード選択ハンドラ
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

// 小文字考慮の最後の文字取得
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

// タイマー開始
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

function submitWord() {
  const input = toHiragana(userInput.value.trim())

  if (!input || !/^[ぁ-んー]+$/.test(input)) {
    alert('ひらがなのみ入力してください')
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

  // Bot の応答処理
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

/* ステータスバー */
.status-bar-container {
  width: 100%;
  height: 6px;
  background-color: #ddd;
  border-radius: 3px;
  overflow: hidden;
  margin: 0.5rem auto;
  max-width: 400px;
}
.status-bar {
  height: 100%;
  background-color: #10b981;
  transition: width 0.1s linear;
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


</style>

