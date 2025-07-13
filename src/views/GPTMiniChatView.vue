<template>
  <div class="gpt-view-wrapper">
    <div class="gpt-chat-container">
      <!-- 🔼 ヘッダー -->
      <div class="gpt-chat-header">
        <template v-if="isEditingTitle">
          <input
            id="titleInput"
            v-model="editedTitle"
            @blur="saveTitle"
            @keyup.enter="saveTitle"
            class="gpt-title-input"
          />
        </template>
        <template v-else>
          <span v-if="isTitleLoaded" @click="startEditTitle">
            {{ sessionTitle }}
          </span>
          <span v-else> </span>
        </template>
      </div>

      <!-- 🔼 メッセージ一覧 -->
      <div class="gpt-message-list">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="gpt-message-row"
          :class="{ mine: msg.isMine }"
        >
          <span v-if="!msg.isMine" class="gpt-avatar">{{ botEmoji }}</span>
          <div
            :class="['gpt-message', { mine: msg.isMine }]"
            v-html="msg.content.replace(/\n/g, '<br>')"
          ></div>
        </div>

        <div v-if="isLoadingReply" class="gpt-message-row">
          <span class="gpt-avatar">{{ botEmoji }}</span>
          <div class="gpt-dots-loader">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <div ref="bottom"></div>
      </div>

      <!-- 🔽 入力欄 -->
      <div class="gpt-input-area">
        <textarea
          v-model="newMessage"
          placeholder="メッセージを入力..."
          rows="1"
          class="gpt-message-input"
          @input="autoResize"
          ref="textareaRef"
        ></textarea>
        <button
          type="button"
          class="gpt-circle-button"
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
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import ChatEffect from '@/components/ChatEffect.vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const route = useRoute()
const sessionId = route.params.id
const mode = route.query.mode || 'breeze'

const newMessage = ref('')
const messages = ref([])
const chatEffect = ref(null)
const bottom = ref(null)
const textareaRef = ref(null)
const sessionTitle = ref('')
const isTitleLoaded = ref(false)
const isEditingTitle = ref(false)
const editedTitle = ref('')

const isLoadingReply = ref(false)

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

  // ✅ popstate でブラウザ戻るを検知
  window.addEventListener('popstate', handleBack)
})

async function fetchHistories() {
  try {
    const sessionRes = await API.graphql(graphqlOperation(getSessionQuery, { id: sessionId }))
    const session = sessionRes.data.getGPTMiniSession
sessionTitle.value = session.title || t('common.untitled')
    isTitleLoaded.value = true

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

function startEditTitle() {
  editedTitle.value = sessionTitle.value
  isEditingTitle.value = true
  nextTick(() => {
    document.getElementById('titleInput')?.focus()
  })
}

function handleBack() {
  sessionStorage.setItem('fromGptChat', 'true')
}

async function saveTitle() {
  if (!editedTitle.value.trim()) {
    isEditingTitle.value = false
    return
  }

  sessionTitle.value = editedTitle.value

  try {
    await API.graphql(graphqlOperation(updateSessionMutation, {
      input: {
        id: sessionId,
        title: editedTitle.value
      }
    }))
    console.log('✅ タイトル更新成功')
  } catch (e) {
    console.error('❌ タイトル更新失敗:', e)
  }

  isEditingTitle.value = false
}

async function sendMessage() {
  const content = newMessage.value.trim()
  if (!content) return

  newMessage.value = ''
  messages.value.push({ content, isMine: true })
  scrollToBottom()

  isLoadingReply.value = true

  try {
    const gptReply = await callGPT()

    messages.value.push({ content: gptReply || '（返答なし）', isMine: false })
    scrollToBottom()

    // ✅ タイトル自動生成（ローカライズ対応）
    if (!sessionTitle.value || sessionTitle.value === '' || sessionTitle.value === t('common.untitled')) {
      const newTitle = generateTitleFromMessage(content)
      sessionTitle.value = newTitle
      isTitleLoaded.value = true

      await API.graphql(graphqlOperation(updateSessionMutation, {
        input: {
          id: sessionId,
          title: newTitle
        }
      }))
      console.log('✅ タイトルを最初のメッセージから自動生成')
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
  } finally {
    isLoadingReply.value = false
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

onBeforeRouteLeave((to, from, next) => {
  try {
    if (messages.value.length === 0) {
      API.graphql(graphqlOperation(deleteSessionMutation, { input: { id: sessionId } }))
        .then(() => console.log('💬 会話がなかったのでセッション削除しました'))
        .catch(e => console.error('❌ セッション削除失敗:', e))
    }
  } catch (e) {
    console.error('❌ セッション削除失敗:', e)
  }

  // ✅ state にフラグをセット
  if (to.name === 'gpt-mini') {
    to.state = { fromChat: true }
  }

  next()
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handleBack)
})

</script>


<style>
.gpt-view-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.gpt-chat-container {
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
  .gpt-chat-container {
    min-width: 600px;
  }
}

.gpt-chat-header {
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

.gpt-message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.gpt-message-row {
  display: flex;
  align-items: flex-end;
  margin: 0.5rem 0;
}

.gpt-message-row.mine {
  justify-content: flex-end;
}

.gpt-message {
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

.gpt-message.mine {
  background-color: #145523;
  color: #fff;
  margin-left: auto;
}

@media (max-width: 600px) {
  .gpt-message {
    max-width: 80vw;
  }
}

.gpt-avatar {
  margin-right: 0.5rem;
}

.gpt-input-area {
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  border-top: 1px solid #333;
  gap: 0.5rem;
}

.gpt-message-input {
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

.gpt-circle-button {
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

.gpt-circle-button:hover {
  background-color: #e0e0e0;
}

.gpt-circle-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .gpt-chat-container {
    background-color: #121212 !important;
    color: #fff !important;
  }

  .gpt-message {
    background-color: #333 !important;
    color: #fff !important;
  }

  .gpt-message.mine {
    background-color: #145523 !important;
  }

  .gpt-chat-header {
    background: rgba(0, 0, 0, 0.4) !important;
    color: #fff !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
}

.gpt-title-input {
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;
  color: inherit;
  outline: none;
}

.gpt-dots-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

.gpt-dots-loader .dot {
  width: 6px;
  height: 6px;
  margin: 0 4px;
  background-color: #888;
  border-radius: 50%;
  opacity: 0.4;
  animation: dot-flash 1.4s infinite ease-in-out both;
}

.gpt-dots-loader .dot:nth-child(1) { animation-delay: 0s; }
.gpt-dots-loader .dot:nth-child(2) { animation-delay: 0.2s; }
.gpt-dots-loader .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-flash {
  0%, 80%, 100% { opacity: 0.4; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-6px); }
}

</style>

