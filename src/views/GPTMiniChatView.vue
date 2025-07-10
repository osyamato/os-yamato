<template>
  <div class="gpt-mini-chat-view">
    <h2>GPT Mini Chat 🌿</h2>
    <p>セッションID: {{ sessionId }}</p>

    <!-- 🔽 メッセージ履歴 -->
    <div class="history-list">
      <div
        v-for="history in histories"
        :key="history.id"
        :class="['message-row', history.isMine ? 'mine' : 'ai']"
      >
        <div class="bubble">
          <p>{{ history.isMine ? history.prompt : history.response }}</p>
          <small>{{ formatDate(history.createdAt) }}</small>
        </div>
      </div>
    </div>

    <!-- 🔽 入力エリア -->
    <div class="input-area">
      <textarea
        v-model="newMessage"
        placeholder="メッセージを入力..."
        rows="1"
        @input="autoResize"
      ></textarea>
      <button @click="sendMessage" :disabled="!newMessage.trim()">送信</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { useRoute } from 'vue-router'

const route = useRoute()
const sessionId = route.params.id

const histories = ref([])
const newMessage = ref('')

// GraphQL クエリ
const listHistoriesQuery = /* GraphQL */ `
  query HistoriesBySession($sessionId: ID!) {
    historiesBySession(sessionId: $sessionId, sortDirection: ASC) {
      items {
        id
        sessionId
        prompt
        response
        createdAt
      }
    }
  }
`

const createHistoryMutation = /* GraphQL */ `
  mutation CreateGPTMiniHistory($input: CreateGPTMiniHistoryInput!) {
    createGPTMiniHistory(input: $input) {
      id
      prompt
      response
      createdAt
    }
  }
`

// 履歴取得
async function fetchHistories() {
  try {
    const res = await API.graphql(graphqlOperation(listHistoriesQuery, { sessionId }))
    const items = res.data.historiesBySession.items || []
    histories.value = items.map(item => ({
      ...item,
      isMine: true
    }))
  } catch (e) {
    console.error('❌ 履歴取得エラー:', e)
  }
}

// 送信
async function sendMessage() {
  if (!newMessage.value.trim()) return

  try {
    const prompt = newMessage.value.trim()
    newMessage.value = ''

    // 仮履歴を追加（即表示）
    const tempHistory = {
      id: `temp-${Date.now()}`,
      prompt,
      response: '…',
      createdAt: new Date().toISOString(),
      isMine: true
    }
    histories.value.push(tempHistory)

    // Lambda (例: Yamato GPT Mini API) へ問い合わせ（ここは実際のAPIに合わせて修正）
    const aiRes = await fetch('https://tfxc3pudv4.execute-api.ap-northeast-1.amazonaws.com/Yamato_GPT_mini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode: 'breeze', language: 'ja' })
    })
    const aiData = await aiRes.json()
    const aiText = aiData.text

    // GraphQL 経由で履歴保存
    const input = {
      sessionId,
      prompt,
      response: aiText,
      language: 'ja'
    }
    const res = await API.graphql(graphqlOperation(createHistoryMutation, { input }))

    // 仮履歴を削除
    histories.value = histories.value.filter(h => h.id !== tempHistory.id)

    // 正式履歴を追加
    histories.value.push({
      ...res.data.createGPTMiniHistory,
      isMine: true
    })
  } catch (e) {
    console.error('❌ メッセージ送信エラー:', e)
  }
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 150) + 'px'
}

onMounted(() => {
  fetchHistories()
})
</script>

<style scoped>
.gpt-mini-chat-view {
  padding: 20px;
}

.history-list {
  margin-bottom: 20px;
}

.message-row {
  display: flex;
  margin-bottom: 10px;
}

.message-row.mine {
  justify-content: flex-end;
}

.message-row.ai {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  background-color: #333;
  color: white;
  position: relative;
}

.message-row.mine .bubble {
  background-color: #3b82f6;
}

.bubble small {
  display: block;
  margin-top: 5px;
  font-size: 0.7rem;
  opacity: 0.7;
}

.input-area {
  display: flex;
  gap: 8px;
}

textarea {
  flex: 1;
  resize: none;
  border-radius: 6px;
  padding: 8px;
  font-size: 1rem;
}

button {
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}
</style>
