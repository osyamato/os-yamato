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

          <!-- 🔽 メッセージ本体 -->
          <div
            v-else
            class="message-row"
            :class="{ mine: msg.senderSub === mySub }"
          >
            <!-- 💬 相手メッセージ -->
            <div v-if="msg.senderSub !== mySub">
              <template v-if="msg.contentType === 'image'">
                <img
                  :src="msg.imageUrl"
                  class="message-image"
                  @click="openImageModal(msg.imageUrl, msg.imageKey)"
                  @load="onImageLoad"
                />
              </template>
              <template v-else>
                <div class="message">
                  <div v-html="msg.content.replace(/\n/g, '<br>')"></div>
                </div>
              </template>
              <span class="timestamp-side">{{ formatTime(msg.timestamp) }}</span>
            </div>

            <!-- 💬 自分のメッセージ -->
            <div v-else>
              <span class="timestamp-side">{{ formatTime(msg.timestamp) }}</span>

              <template v-if="msg.contentType === 'image'">
                <img
                  :src="msg.imageUrl"
                  class="message-image"
                  @click="openImageModal(msg.imageUrl, msg.imageKey)"
                  @load="onImageLoad"
                />
              </template>
              <template v-else>
                <div class="message mine">
                  <div v-html="msg.content.replace(/\n/g, '<br>')"></div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <div ref="bottomOfChat"></div>
      </div>

      <!-- ✨ アニメーション効果 -->
      <ChatEffect ref="chatEffect" />

      <!-- 🔽 入力欄 -->
      <div class="input-area">
<button type="button" @click="openPhotoPicker" class="circle-button">🖼</button>
<textarea
  ref="textareaRef"
  v-model="newMessage"
  placeholder="メッセージを入力..."
  rows="1"
  class="message-input"
  @input="autoResize"
  @compositionstart="handleCompositionStart"
  @compositionend="handleCompositionEnd"
></textarea>
<button
  type="button"
  :disabled="!newMessage.trim() || (isComposing && isJapaneseInput)"
  :class="['circle-button', { disabled: isComposing && isJapaneseInput }]"
  @mousedown.prevent
  @click="sendMessage"
>
  ⇧
</button>
      </div>
    </div>

    <!-- 📷 写真セレクタ -->
    <PhotoPickerPanel
      v-if="showPhotoPicker && isMobile"
      @close="showPhotoPicker = false"
      @send="handlePhotoSelect"
    />
    <PhotoPickerModal
      v-else-if="showPhotoPicker"
      @close="showPhotoPicker = false"
      @send="handlePhotoSelect"
    />

    <!-- 👁 フル画像プレビュー -->
<ImagePreviewModal
  :visible="showImageModal"
  :imageUrl="previewImageUrl"
  :imageKey="previewImageKey"
  @close="showImageModal = false"
/>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watchEffect, watch, nextTick, onBeforeUnmount } from 'vue'
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify'
import { listMessages, publicProfileByYamatoId } from '@/graphql/queries'
import { updateChatRoom, createMessage } from '@/graphql/mutations'
import { onCreateMessage } from '@/graphql/subscriptions'
import { useRoute } from 'vue-router'
import ChatEffect from '@/components/ChatEffect.vue'
import PhotoPickerModal from '@/components/PhotoPickerModal.vue'
import PhotoPickerPanel from '@/components/PhotoPickerPanel.vue'
import ImagePreviewModal from '@/components/ImagePreviewModal.vue'

const showImageModal = ref(false)
const previewImageUrl = ref('')
const previewImageKey = ref('')



const loadedImageCount = ref(0)

function onImageLoad() {
  loadedImageCount.value++

  // 全部読み込まれたらスクロール
  if (loadedImageCount.value >= imageCount.value) {
    nextTick(() => scrollToBottom(true))
  }
}

async function openImageModal(thumbnailUrl, fullKey) {
  try {
    const fullUrl = await Storage.get(fullKey, { level: 'public' })
    previewImageUrl.value = fullUrl
    previewImageKey.value = fullKey // ✅ これを追加
  } catch (e) {
    console.warn('❌ フル画像取得に失敗。代わりにサムネイルを表示:', e)
    previewImageUrl.value = thumbnailUrl
    previewImageKey.value = fullKey // ✅ fallback 用にも key を渡す
  } finally {
    showImageModal.value = true
  }
}



const chatEffect = ref(null)
const textareaRef = ref(null)
const isComposing = ref(false)
const bottomOfChat = ref(null)

const partnerDisplayName = ref('')
const messages = ref([])
const newMessage = ref('')
const myYamatoId = ref('')
const mySub = ref('')
const roomId = ref('')
const receiverYamatoId = ref('')
const receiverSub = ref('')
const showPhotoPicker = ref(false)
const isMobile = ref(false)


const isJapaneseInput = ref(false)

const handleCompositionStart = (e) => {
  isComposing.value = true
  isJapaneseInput.value = /[ぁ-んァ-ン]/.test(e.data || '')
}

const handleCompositionEnd = () => {
  isComposing.value = false
  isJapaneseInput.value = false
}


const route = useRoute()
let subscription = null

const groupedMessages = computed(() => groupMessagesByDate(messages.value))

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
})

function openPhotoPicker() {
  showPhotoPicker.value = true
}

async function handlePhotoSelect(photoOrPhotos) {
  const photos = Array.isArray(photoOrPhotos) ? photoOrPhotos : [photoOrPhotos]

  for (const photo of photos) {
    if (!photo || !photo.imageKey || !photo.thumbnailKey) {
      console.warn('⚠️ 不正なphotoオブジェクト:', photo)
      continue
    }

    const now = new Date()
    const tempId = `temp-${now.getTime()}`

    const tempMessage = {
      id: tempId,
      roomId: roomId.value,
      senderSub: mySub.value,
      senderYamatoId: myYamatoId.value,
      receiverSub: receiverSub.value,
      receiverYamatoId: receiverYamatoId.value,
      content: '',
      contentType: 'image',
      imageKey: photo.imageKey,
      thumbnailKey: photo.thumbnailKey,
      timestamp: now.toISOString(),
      imageUrl: photo.previewUrl || '', // 👈 最初は preview
      isTemporary: true,
    }

    messages.value.push(tempMessage)

    try {
      await sendImageMessage(photo.imageKey, photo.thumbnailKey)

      // ⚠️ tryGetUrlで正式URL取得して仮メッセージ更新
      const finalUrl = await tryGetUrl(photo.thumbnailKey)
      const msg = messages.value.find(m => m.id === tempId)
      if (msg && finalUrl) msg.imageUrl = finalUrl

      // 🎯 サブスクで正式メッセージが来たら temp は削除される
    } catch (e) {
      console.error('❌ 画像送信エラー:', e)
    }
  }

  showPhotoPicker.value = false
}

async function sendImageMessage(imageKey, thumbnailKey) {
  const now = new Date()
  const expiresAt = Math.floor(now.getTime() / 1000) + 365 * 24 * 60 * 60

  const input = {
    roomId: roomId.value,
    senderSub: mySub.value,
    senderYamatoId: myYamatoId.value,
    receiverSub: receiverSub.value,
    receiverYamatoId: receiverYamatoId.value,
    content: '',
    contentType: 'image',
    imageKey,
    thumbnailKey,
    timestamp: now.toISOString(),
    expiresAt
  }

  try {
    // ① メッセージ送信
    await API.graphql(graphqlOperation(createMessage, { input }))

    // ② ChatRoom を更新（❗️これがなかった）
    await API.graphql(graphqlOperation(updateChatRoom, {
      input: {
        id: roomId.value,
        lastMessage: '', // または "📷 写真"
        lastContentType: 'image',
        lastSenderId: mySub.value,
        lastTimestamp: now.toISOString()
      }
    }))
  } catch (err) {
    console.error('❌ 画像メッセージ送信エラー:', JSON.stringify(err, null, 2))
  }
}

watchEffect(() => {
  const params = route?.params || {}
  roomId.value = params.roomId || ''
  receiverYamatoId.value = params.receiverYamatoId || ''
})
watch(() => groupedMessages.value, async () => {
  await nextTick()
  scrollToBottom()
})

function maybePlayEffect(content) {
  if (!chatEffect.value) {
    console.log('🚨 chatEffect is not ready')
    return false
  }

  // 固定正規表現で特殊エフェクト
  const specialPatterns = [
    { pattern: /(i love you|愛している|愛してる)/i, effect: 'moon' },
    { pattern: /(金閣寺|三島由紀夫|愛国|林ゆかり|倉岡剛)/, effect: 'mishima' },
    { pattern: /(プラネタリウム|planetarium|space|宇宙|土星|saturn)/i, effect: 'saturn' },
    { pattern: /(おめでとう|お祝い|祝|congratulations|congrats|celebrate)/i, effect: 'confetti' },
    { pattern: /(星空|モンゴル|星|夜空|stars|starry sky|night sky|mongolia)/i, effect: 'starry' },
    { pattern: /(シャボン玉|泡|bubble|bubbles|soap bubble)/i, effect: 'bubble' }
  ]

  const seasonalPatterns = [
    { pattern: /(雨|rain)/i, effect: 'rain' },
    { pattern: /(雪|snow)/i, effect: 'snow' },
    { pattern: /(晴れ|sunny)/i, effect: 'sunny' },
    { pattern: /(風|wind)/i, effect: 'wind' },
    { pattern: /(春|spring)/i, effect: 'spring' },
    { pattern: /(桜|cherry blossom)/i, effect: 'spring' },
    { pattern: /(秋|fall|autumn)/i, effect: 'autumn' },
    { pattern: /(冬|winter)/i, effect: 'snow' }
  ]

  // 特殊パターン優先
  for (const { pattern, effect } of specialPatterns) {
    if (pattern.test(content)) {
      console.log('🎇 Special pattern matched:', effect)
      chatEffect.value.playEffect(effect)
      hideKeyboard()
      return true
    }
  }

  // 季節パターン
  for (const { pattern, effect } of seasonalPatterns) {
    if (pattern.test(content)) {
      console.log('🍃 Seasonal pattern matched:', effect)
      chatEffect.value.playEffect(effect)
      hideKeyboard()
      return true
    }
  }

  // 夏だけ特殊呼び出し
  if (/夏|summer/i.test(content)) {
    console.log('☀️ Summer pattern matched: triggerSummer')
    chatEffect.value.triggerSummer()
    hideKeyboard()
    return true
  }

  console.log('❌ No effect matched')
  return false
}


watch(messages, () => {
  const lastMsg = messages.value[messages.value.length - 1]
  if (!lastMsg || lastMsg.senderSub === mySub.value) return
  maybePlayEffect(lastMsg.content)
})

function hideKeyboard() {
  const el = document.activeElement
  if (el && typeof el.blur === 'function') el.blur()
}

const imageCount = computed(() =>
  groupedMessages.value
    .flatMap(group => group.messages)
    .filter(msg => msg?.contentType === 'image').length
)

// ✅ onMounted
onMounted(async () => {
  await nextTick()
  scrollToBottom()

  const user = await Auth.currentAuthenticatedUser()
  mySub.value = user.attributes.sub

  const res = await API.graphql({
    query: /* GraphQL */ `
      query GetMyProfile($id: ID!) {
        getPublicProfile(id: $id) {
          yamatoId
        }
      }`,
    variables: { id: mySub.value },
    authMode: 'AMAZON_COGNITO_USER_POOLS'
  })
  myYamatoId.value = res.data.getPublicProfile.yamatoId

  const profileRes = await API.graphql(graphqlOperation(publicProfileByYamatoId, {
    yamatoId: receiverYamatoId.value
  }))
  const partner = profileRes.data.publicProfileByYamatoId.items[0]

  if (!partner) {
    console.warn('⚠️ partner が見つかりませんでした')
    partnerDisplayName.value = '不明'
    return
  }

  partnerDisplayName.value = partner.displayName || '相手'
  receiverSub.value = partner.id

  await fetchMessages()
  loadedImageCount.value = 0

  await nextTick()

  if (imageCount.value === 0) {
    scrollToBottom(true)
  }

  subscribeToNewMessages()
})

onBeforeUnmount(() => {
  if (subscription) subscription.unsubscribe()
})

async function fetchMessages() {
  try {
    const res = await API.graphql(graphqlOperation(listMessages, {
      filter: { roomId: { eq: roomId.value } },
      limit: 100
    }))

    const items = res.data.listMessages.items
      .filter(msg => msg)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const enriched = await Promise.all(items.map(async msg => {
      if (msg.contentType === 'image' && msg.imageKey) {
        try {
          const url = await Storage.get(msg.thumbnailKey || msg.imageKey, { level: 'public' })
          return { ...msg, imageUrl: url }
        } catch (e) {
          console.warn('⚠️ 画像の取得に失敗:', e)
          return msg
        }
      }
      return msg
    }))

    messages.value = enriched
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('❌ メッセージ取得エラー:', JSON.stringify(err, null, 2))
  }
}

async function sendMessage() {
  if (isComposing.value) return
const content = (newMessage.value || '').trim() 
  if (!content) return

  const now = new Date()
  const expiresAt = Math.floor(now.getTime() / 1000) + 365 * 24 * 60 * 60

  const input = {
    roomId: roomId.value,
    senderSub: mySub.value,
    senderYamatoId: myYamatoId.value,
    receiverSub: receiverSub.value,
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
    lastContentType: 'text', // ✅ ← これを追加！
    lastTimestamp: now.toISOString(),
    lastSenderId: mySub.value,
    expiresAt
  }
}))
    newMessage.value = ''
    await nextTick()
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
    const triggered = maybePlayEffect(content)
    if (!triggered && textareaRef.value) textareaRef.value.focus()
  } catch (err) {
    console.error('❌ メッセージ送信エラー:', JSON.stringify(err, null, 2))
    if (err.errors) err.errors.forEach(e => console.error('GraphQL Error:', e.message))
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
      if (!newMsg?.roomId) {
        console.warn('⚠️ 無効なメッセージを受信:', value)
        return
      }

      if (newMsg.roomId === roomId.value) {
        let enrichedMsg = newMsg

        // 💬 画像メッセージの場合に imageUrl を取得
        if (newMsg.contentType === 'image' && newMsg.imageKey) {
          try {
            const url = await Storage.get(newMsg.thumbnailKey || newMsg.imageKey, {
              level: 'public'
            })
            enrichedMsg = { ...newMsg, imageUrl: url }
          } catch (e) {
            console.warn('⚠️ サブスク中の画像取得エラー:', e)
          }
        }

        // ✅ すでに同じ imageKey の仮メッセージがあるか確認（isTemporary: true）
        const existingIndex = messages.value.findIndex(
          m => m.imageKey === newMsg.imageKey && m.isTemporary
        )

        if (existingIndex !== -1) {
          // ✅ 仮メッセージを正式メッセージで置き換える
          messages.value.splice(existingIndex, 1, enrichedMsg)
        } else {
          // ✅ 通常の追加
          messages.value.push(enrichedMsg)
        }

        if (enrichedMsg.senderSub !== mySub.value) {
          maybePlayEffect(enrichedMsg.content)
        }

await nextTick()
setTimeout(() => scrollToBottom(), 0)
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
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
    })
    if (date !== lastDate) {
      grouped.push({ isDateSeparator: true, date })
      lastDate = date
    }
    grouped.push(msg)
  }
  return grouped
}

function scrollToBottom(immediate = false) {
  bottomOfChat.value?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
}

function shouldTriggerEffect(content, season) {
  const pattern = new RegExp(`${season}(?![一-龯])`)
  return pattern.test(content)
}


async function tryGetUrl(key, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const url = await Storage.get(key, { level: 'public' })
      return url
    } catch (e) {
      console.warn(`🕓 retry ${i + 1} for key: ${key}`, e)
      await new Promise(res => setTimeout(res, delay))
    }
  }
  console.error('❌ Storage.get 失敗:', key)
  return null
}

</script>


<style scoped>

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  color: #000;
  box-sizing: border-box;

  width: 100%;
  margin: 0 auto;
  max-width: 600px; /* ✅ PC向け最大幅 */
}

/* ✅ PC向けにmin-widthを追加 */
@media (min-width: 768px) {
  .chat-container {
    min-width: 600px;
  }
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

.message-image {
  max-width: 220px;
  max-height: 220px;
  border-radius: 12px;
  object-fit: cover;
}

/* styleタグ内に追加 */
.message-image.temp {
  opacity: 0.4;
  filter: blur(1px);
}

.message-row.mine {
  justify-content: flex-end;
  text-align: right; /* 💡 吹き出し内のテキストを右寄せ */
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

  /* 💡 全デバイスで横に広がりすぎないように制限 */
  max-width: 80vw;
  max-width: min(80vw, 520px); /* 💡 スマホでは80%、PCでは最大520px */
}

.message.mine {
  background-color: #274c77;
  color: #fff;
  margin-left: auto; /* 💡 自分の吹き出しは右に寄せる */
}

/* ✅ スマホはやや狭め（70vw） */
@media (max-width: 600px) {
  .message {
    max-width: 70vw;
  }
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


.circle-button {
  background-color: #274c77;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 2.4rem !important;
  height: 2.4rem !important;
  font-size: 1.2rem;
  display: inline-flex;         /* 💡 PC時の拡張を抑制 */
  align-items: center;
  justify-content: center;
  margin-left: 0.4rem;
  cursor: pointer;
  flex: 0 0 auto;               /* 💡 完全固定にする */
  transition: background-color 0.2s ease;
}

.circle-button:hover {
  background-color: #e0e0e0;
}

.circle-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


</style>
