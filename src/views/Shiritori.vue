<template>
  <div class="chat-wrapper">
    <!-- タイトルとアイコン -->
    <div class="header">
      <h2 class="header-title">しりとり</h2>
      <div class="icon-button-group">
        <button class="icon-button">🌱</button>
        <button class="icon-button" @click="resetGame">🌀</button>
        <button class="icon-button">🌸</button>
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
      <div
        v-for="(entry, index) in [...history].reverse()"
        :key="index"
        class="message-pair"
      >
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

      <!-- ゲームオーバー表示 -->
      <div v-if="gameOver" class="gameover-message">⏰ ゲームオーバー</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const userInput = ref('')
const history = ref([])
const gameOver = ref(false)
const timerStarted = ref(false)

const TIMER_DURATION = 10000
const progress = ref(0)
let intervalId = null
let startTime = null

const words = ['りんご', 'ごりら', 'らっぱ', 'ぱんだ', 'だるま', 'まくら', 'らいおん']

function toHiragana(str) {
  return str.replace(/[\u30a1-\u30f6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  )
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
  return words.find(w => w.startsWith(lastChar)) || 'おわり'
}

function startTimer() {
  clearInterval(intervalId)
  progress.value = 0
  startTime = Date.now()
  timerStarted.value = true

  intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime
    progress.value = Math.min(100, (elapsed / TIMER_DURATION) * 100)

    if (elapsed >= TIMER_DURATION) {
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

    if (!bot.includes('終了')) {
      startTimer()
    } else {
      gameOver.value = true
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
</style>

