<template>
  <div class="view-wrapper">
    <div class="chat-container">
      <!-- 🔼 ヘッダー -->
<div class="chat-header">{{ sessionTitle || '風にたずねる' }}</div>

      <!-- 🔼 メッセージ一覧 -->
      <div class="message-list">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message-row"
          :class="{ mine: msg.isMine }"
        >
<span v-if="!msg.isMine" class="avatar">{{ botEmoji }}</span>
          <div :class="['message', { mine: msg.isMine }]" v-html="msg.content.replace(/\n/g, '<br>')"></div>
        </div>
        <div ref="bottom"></div>
      </div>

      <!-- ✨ エフェクト -->
      <ChatEffect ref="chatEffect" />

      <!-- 🔽 入力欄 -->
      <div class="input-area">
        <textarea
          v-model="newMessage"
          placeholder="メッセージを入力..."
          rows="1"
          class="message-input"
          @input="autoResize"
          ref="textareaRef"
        ></textarea>
        <button
          type="button"
          class="circle-button"
          :disabled="!newMessage.trim()"
          @click="sendMessage"
        >
          ⇧
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import ChatEffect from '@/components/ChatEffect.vue'

const route = useRoute()
const sessionId = route.params.id
const mode = route.query.mode || 'breeze' 

const newMessage = ref('')
const messages = ref([])
const chatEffect = ref(null)
const bottom = ref(null)
const textareaRef = ref(null)
const sessionTitle = ref('')

const botEmojiMap = {
  breeze: '🍃',
  deep: '💭',
  poetic: '🌙',
  factual: '📖'
}

const botEmoji = ref(botEmojiMap[mode] || '🤖')

const listHistoriesQuery = /* GraphQL */ `
  query ListGPTMiniHistories($sessionId: ID!) {
    listGPTMiniHistories(filter: { sessionId: { eq: $sessionId } }) {
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
const getSessionQuery = /* GraphQL */ `
  query GetGPTMiniSession($id: ID!) {
    getGPTMiniSession(id: $id) {
      id
      title
      mode
    }
  }
`

const createHistoryMutation = /* GraphQL */ `
  mutation CreateGPTMiniHistory($input: CreateGPTMiniHistoryInput!) {
    createGPTMiniHistory(input: $input) {
      id
      sessionId
      prompt
      response
      createdAt
    }
  }
`

const updateSessionMutation = /* GraphQL */ `
  mutation UpdateGPTMiniSession($input: UpdateGPTMiniSessionInput!) {
    updateGPTMiniSession(input: $input) {
      id
      title
    }
  }
`

const deleteSessionMutation = /* GraphQL */ `
  mutation DeleteGPTMiniSession($input: DeleteGPTMiniSessionInput!) {
    deleteGPTMiniSession(input: $input) {
      id
    }
  }
`

onMounted(() => {
  fetchHistories()
})

async function fetchHistories() {
  try {
    // ✅ セッション情報を先に取得
    const sessionRes = await API.graphql(graphqlOperation(getSessionQuery, { id: sessionId }))
    const session = sessionRes.data.getGPTMiniSession
    sessionTitle.value = session.title || '(無題)'

    // ✅ 履歴取得
    const res = await API.graphql(graphqlOperation(listHistoriesQuery, { sessionId }))
    const items = res.data.listGPTMiniHistories.items || []

    messages.value = items
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .flatMap(item => [
        { content: item.prompt || '（内容なし）', isMine: true },
        { content: item.response || '（返答なし）', isMine: false }
      ])

    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('❌ 履歴 or セッション取得エラー:', e)
  }
}

async function sendMessage() {
  const content = newMessage.value.trim()
  if (!content) return

  newMessage.value = ''

  messages.value.push({ content, isMine: true })
  scrollToBottom()

  try {
    const gptReply = await callGPT()

    messages.value.push({ content: gptReply || '（返答なし）', isMine: false })
    scrollToBottom()

    // ✅ 最初の送信時にタイトル自動生成
    if (!sessionTitle.value || sessionTitle.value === '') {
      const newTitle = generateTitleFromMessage(content)
      sessionTitle.value = newTitle

      await API.graphql(graphqlOperation(updateSessionMutation, {
        input: {
          id: sessionId,
          title: newTitle
        }
      }))
    }

    const now = new Date().toISOString()
    const input = {
      sessionId,
      prompt: content,
      response: gptReply,
      createdAt: now,
    }
    await API.graphql(graphqlOperation(createHistoryMutation, { input }))

    maybePlayEffect(content)
  } catch (e) {
    console.error('❌ GPT 呼び出し失敗:', e)
    messages.value.push({ content: '⚠️ GPT 呼び出しに失敗しました。', isMine: false })
  }

  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  })
}

function generateTitleFromMessage(content) {
  if (!content) return '(無題)'
  const snippet = content.slice(0, 10)
  return `${snippet}…`
}

async function callGPT() {
  try {
    // ✅ 会話履歴を全件送る
    const conversationHistory = messages.value.map(m => ({
      role: m.isMine ? "user" : "assistant",
      content: m.content
    }))

    const res = await fetch('https://tfxc3pudv4.execute-api.ap-northeast-1.amazonaws.com/Yamato_GPT_mini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory, mode })
    })

    const data = await res.json()
    return data.text || '（返答なし）'
  } catch (e) {
    console.error('❌ GPT 呼び出し失敗:', e)
    return '⚠️ エラーが発生しました。'
  }
}

function maybePlayEffect(content) {
  if (!chatEffect.value) return

  if (/風|breeze/i.test(content)) {
    chatEffect.value.playEffect('wind')
  } else if (/深い|deep/i.test(content)) {
    chatEffect.value.playEffect('starry')
  } else if (/詩的|poetic/i.test(content)) {
    chatEffect.value.playEffect('bubble')
  }
}

function scrollToBottom() {
  nextTick(() => {
    bottom.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

function autoResize(event) {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
}

// ✅ ナビゲーションガードで履歴がない場合は削除
onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (messages.value.length === 0) {
      await API.graphql(graphqlOperation(deleteSessionMutation, { input: { id: sessionId } }))
      console.log('💬 会話がなかったのでセッション削除しました')
    }
  } catch (e) {
    console.error('❌ セッション削除失敗:', e)
  }
  next()
})
</script>



<style>
.view-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  color: #000;
  margin: 0 auto;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .chat-container {
    min-width: 600px;
  }
}

.chat-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.message-row {
  display: flex;
  align-items: flex-end;
  margin: 0.5rem 0;
}

.message-row.mine {
  justify-content: flex-end;
}

.message {
  display: inline-block;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  font-size: 1rem;
  background-color: #e0e0e0;
  color: #000;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  text-align: left;
  max-width: 80vw;
  max-width: min(80vw, 520px);
}

.message.mine {
  background-color: #145523 !important; /* ✅ 濃い緑に強制 */
  color: #fff !important;
  margin-left: auto;
}

@media (max-width: 600px) {
  .message {
    max-width: 70vw;
  }
}

.avatar {
  margin-right: 0.5rem;
}

.input-area {
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  border-top: 1px solid #333;
  gap: 0.5rem;
}

.message-input {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border-radius: 18px;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #000;
  resize: none;
  max-height: 150px;
  min-height: 40px;
  box-sizing: border-box;
}

.circle-button {
  background-color: #145523;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 2.4rem !important;
  height: 2.4rem !important;
  font-size: 1.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.4rem;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background-color 0.2s ease;
}

.circle-button:hover {
  background-color: #e0e0e0;
}

.circle-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .chat-container {
    background-color: #121212 !important;
    color: #fff !important;
  }

  .message {
    background-color: #333 !important;
    color: #fff !important;
  }

  .message.mine {
    background-color: #145523 !important;
  }

  .chat-header {
    background: rgba(0, 0, 0, 0.4) !important;
    color: #fff !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
}
</style>

