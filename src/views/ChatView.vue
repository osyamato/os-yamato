<template>
  <div class="view-wrapper" @click="dismissKeyboard">
    <div class="chat-container">
      <!-- 🔼 ヘッダー -->
      <div class="chat-header">
        <span>{{ partnerDisplayName }}</span>
      </div>

      <!-- 🔼 メッセージ一覧 -->
      <div class="message-list">
        <template v-for="(msg, index) in groupedMessages" :key="msg.id || index">
          <div v-if="msg.isDateSeparator" class="date-separator">
            {{ msg.date }}
          </div>

          <!-- メッセージ本体 -->
          <div
            v-else
            class="message-row"
            :class="{ mine: msg.senderYamatoId === myYamatoId }"
          >
            <!-- 相手メッセージ -->
            <template v-if="msg.senderYamatoId !== myYamatoId">
              <div class="message" v-html="msg.content.replace(/\n/g, '<br>')"></div>
              <span class="timestamp-side">{{ formatTime(msg.timestamp) }}</span>
            </template>

            <!-- 自分メッセージ -->
            <template v-else>
              <span class="timestamp-side">{{ formatTime(msg.timestamp) }}</span>
              <div class="message mine" v-html="msg.content.replace(/\n/g, '<br>')"></div>
            </template>
          </div>
        </template>
        <!-- 🔻 スクロールマーカー -->
        <div ref="bottomOfChat"></div>
      </div>
<ChatEffect ref="chatEffect" />


      <!-- 🔽 入力欄 -->
      <div class="input-area">
<textarea
  ref="textareaRef"
  v-model="newMessage"
  placeholder="メッセージを入力..."
  rows="1"
  class="message-input"
  @input="autoResize"
  @compositionstart="isComposing = true"
  @compositionend="isComposing = false"
/>
<!-- 👇 キーボードを閉じさせないために @mousedown.prevent を追加 -->
<button
  type="button"
  :disabled="!newMessage.trim() || isComposing"
  :class="{ disabled: isComposing }"
  @mousedown.prevent
  @click="sendMessage"
>
⇧
</button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, watch, nextTick, onBeforeUnmount } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listMessages, publicProfileByYamatoId } from '@/graphql/queries'
import { updateChatRoom, createMessage } from '@/graphql/mutations'
import { onCreateMessage } from '@/graphql/subscriptions'
import { useRoute } from 'vue-router'
import ChatEffect from '@/components/ChatEffect.vue' // ← 追加
const chatEffect = ref(null)   
const textareaRef = ref(null)
const isComposing = ref(false)


const bottomOfChat = ref(null)

onMounted(async () => {
  await nextTick()
  bottomOfChat.value?.scrollIntoView({ behavior: 'smooth' })
})


const partnerDisplayName = ref('')
const messages = ref([])
const newMessage = ref('')
const myYamatoId = ref('')
const mySub = ref('')
const roomId = ref('')
const receiverYamatoId = ref('')
const route = useRoute()
let subscription = null

const groupedMessages = computed(() => groupMessagesByDate(messages.value))

watchEffect(() => {
  roomId.value = route.params.roomId || ''
  receiverYamatoId.value = route.params.receiverYamatoId || ''
})

watch(() => groupedMessages.value, async () => {
  await nextTick()
  bottomOfChat.value?.scrollIntoView({ behavior: 'smooth' })
})


function maybePlayEffect(content) {
  if (!chatEffect.value) return false // 🎯 false を返す

const effects = [
  { pattern: new RegExp(`(i love you|愛している|愛してる)(?![一-龯])`, 'i'), effect: 'moon' },
  { pattern: new RegExp(`(金閣寺|三島由紀夫|愛国|林ゆかり|倉岡剛)(?![一-龯])`), effect: 'mishima' },
  { pattern: new RegExp(`(プラネタリウム|宇宙|土星)(?![一-龯])`), effect: 'saturn' },
  { pattern: new RegExp(`(おめでとう|お祝い|祝|congratulations)(?![一-龯])`, 'i'), effect: 'confetti' },
  { pattern: new RegExp(`(星空|モンゴル|星|夜空)(?![一-龯])`, 'u'), effect: 'starry' }
]

  for (const { pattern, effect } of effects) {
    if (pattern.test(content)) {
      chatEffect.value.playEffect(effect)
      hideKeyboard()
      return true
    }
  }

  const seasonalMap = {
    '雨': 'rain',
    '雪': 'snow',
    '晴れ': 'sunny',
    '風': 'wind',
    '春': 'spring',
    '桜': 'spring',
    '秋': 'autumn',
    '冬': 'snow'
  }

  for (const word in seasonalMap) {
    if (shouldTriggerEffect(content, word)) {
      chatEffect.value.playEffect(seasonalMap[word])
      hideKeyboard()
      return true
    }
  }

  if (shouldTriggerEffect(content, '夏')) {
    chatEffect.value.triggerSummer()
    hideKeyboard()
    return true
  }

  return false // 🎯 どれにもマッチしなかった場合
}

watch(messages, () => {
  const lastMsg = messages.value[messages.value.length - 1]
  if (!lastMsg) return

  // ✅ 自分の送信したメッセージならスキップ（sendMessage内で処理済みだから）
  if (lastMsg.senderYamatoId === myYamatoId.value) return

  maybePlayEffect(lastMsg.content)
})

function hideKeyboard() {
  const el = document.activeElement
  if (el && typeof el.blur === 'function') {
    el.blur()
  }
}


onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  mySub.value = user.attributes.sub

  const res = await API.graphql({
    query: /* GraphQL */ `
      query GetMyProfile($id: ID!) {
        getPublicProfile(id: $id) {
          yamatoId
        }
      }
    `,
    variables: { id: mySub.value },
    authMode: 'AMAZON_COGNITO_USER_POOLS'
  })
  myYamatoId.value = res.data.getPublicProfile.yamatoId

  // 相手の名前取得
  const profileRes = await API.graphql(graphqlOperation(publicProfileByYamatoId, {
    yamatoId: receiverYamatoId.value
  }))
  partnerDisplayName.value = profileRes.data.publicProfileByYamatoId.items[0]?.displayName || '相手'

  await fetchMessages()
  subscribeToNewMessages()
})

onBeforeUnmount(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})

async function fetchMessages() {
  try {
    const res = await API.graphql(graphqlOperation(listMessages, {
      filter: { roomId: { eq: roomId.value } },
      limit: 100
    }))
    messages.value = res.data.listMessages.items
      .filter(msg => msg)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('❌ メッセージ取得エラー:', JSON.stringify(err, null, 2))
  }
}
async function sendMessage() {
 if (isComposing.value) return
  const content = newMessage.value.trim()
  if (!content) return

  const now = new Date()
  const expiresAt = Math.floor(now.getTime() / 1000) + 365 * 24 * 60 * 60

  const input = {
    roomId: roomId.value,
    senderYamatoId: myYamatoId.value,
    receiverYamatoId: receiverYamatoId.value,
    content,
    timestamp: now.toISOString(),
    expiresAt
  }

  try {
    await API.graphql(graphqlOperation(createMessage, { input }))

    await API.graphql(graphqlOperation(updateChatRoom, {
      input: {
        id: roomId.value,
        lastMessage: content,
        lastTimestamp: now.toISOString(),
        lastSenderId: mySub.value,
        expiresAt
      }
    }))

    newMessage.value = ''
    await nextTick()

    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }

    const triggered = maybePlayEffect(content)

    if (!triggered && textareaRef.value) {
      textareaRef.value.focus()  // 🎯 通常メッセージはフォーカス維持
    }

  } catch (err) {
    console.error('❌ メッセージ送信エラー:', JSON.stringify(err, null, 2))
    if (err.errors) {
      err.errors.forEach(e => console.error('GraphQL Error:', e.message))
    }
  }
}

function autoResize(event) {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
}

function formatTime(ts) {
  const date = new Date(ts)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function subscribeToNewMessages() {
  subscription = API.graphql(graphqlOperation(onCreateMessage)).subscribe({
    next: async ({ value }) => {
      const newMsg = value?.data?.onCreateMessage
      if (!newMsg || !newMsg.roomId) {
        console.warn('⚠️ 無効なメッセージを受信:', value)
        return
      }

      if (newMsg.roomId === roomId.value) {
        messages.value.push(newMsg)

        if (newMsg.senderYamatoId !== myYamatoId.value) {
          maybePlayEffect(newMsg.content)
        }

        await nextTick()
        scrollToBottom()
      }
    },
    error: (err) => console.error('❌ サブスクリプションエラー:', err)
  })
}



function groupMessagesByDate(messages) {
  const grouped = []
  let lastDate = null

  for (const msg of messages) {
    const date = new Date(msg.timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })

    if (date !== lastDate) {
      grouped.push({ isDateSeparator: true, date })
      lastDate = date
    }

    grouped.push(msg)
  }

  return grouped
}


function scrollToBottom() {
  bottomOfChat.value?.scrollIntoView({ behavior: 'smooth' })
}

function shouldTriggerEffect(content, season) {
  const pattern = new RegExp(`${season}(?![一-龯])`)
  return pattern.test(content)
}

</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff; /* ✅ 通常モードでは白背景 */
  color: #000;          /* ✅ 通常モードの文字色 */
}

button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* 吹き出し + 時間の1セット（横並び） */
.message-row {
  display: flex;
  justify-content: flex-start; /* 相手：左寄せ */
  align-items: flex-end;
  margin: 0.5rem 0;
}

.message-row.mine {
  justify-content: flex-end; /* 自分：右寄せ */
}

/* 吹き出し本体 */
.message {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  max-width: 75%;
  font-size: 1rem;
  word-wrap: break-word;
  display: inline-block;
  background-color: #e0e0e0;  /* 淡いグレー */
  color: #000;   
}

.message.mine {
  background-color: #274c77; /* 和風な淡い青 */
  color: #fff;
}

/* 吹き出し横の時間 */
.timestamp-side {
  font-size: 0.75rem;
  color: #aaa;
  margin: 0 0.5rem;
  white-space: nowrap;
  align-self: center;
}

/* 日付セパレータ */
.date-separator {
  text-align: center;
  margin: 1rem 0 0.5rem;
  font-size: 0.8rem;
  color: #bbb;
}

/* 入力欄 */
.input-area {
  display: flex;
  align-items: flex-end; /* ✅ ボタンを下端にそろえる */
  padding: 1rem;
  border-top: 1px solid #333;
  gap: 0.5rem;
}

.modal-title {
  color: #111; /* ← ライトモード用の黒文字 */
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.message-input {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border-radius: 18px;
  border: 1px solid #ccc;
  background: #1e1e1e;
  color: #fff;
  overflow-y: auto;
  resize: none;
  max-height: 150px;
  min-height: 40px;
  transition: height 0.1s ease-out;
  box-sizing: border-box;
}


button {
  flex-shrink: 0;
  height: 40px;           /* ✅ テキスト欄と揃える */
  padding: 0 1rem;
  font-size: 1rem;
  background-color: #274c77;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
  align-self: flex-end;
}

button:hover {
  opacity: 0.9;
}

.message-input {
  background-color: #fff; /* 通常モードでは白 */
  color: #000;
  border: 1px solid #ccc;
  border-radius: 18px;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  resize: none;
  box-sizing: border-box;
}

.view-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.chat-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.5); /* ← 🌸 透過率アップ */
  backdrop-filter: blur(10px);          /* ← ぼかし効果強め */
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* ソフトな境界線 */
  color: #333;
}


/* ダークモード */
/* 👇 scopedスタイル内でもしっかり適用されるように :deep() を使う */
/* 💡 既存の .chat-container に対するダークモードの指定が不完全 */
@media (prefers-color-scheme: dark) {
  .chat-container {
    background-color: #121212 !important; /* 強制的に適用させる */
    color: #fff !important;
  }

  .message {
    background-color: #333 !important;
    color: #fff !important;
  }

  .message.mine {
    background-color: #274c77 !important; /* 自分の吹き出しの色は変えない */
  }

  .chat-header {
    background: rgba(0, 0, 0, 0.4) !important;
    color: #fff !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  }

}

</style>
 
