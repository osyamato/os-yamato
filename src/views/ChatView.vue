<template>
<div class="view-wrapper" @click="dismissKeyboard">
    <div class="chat-container">
      <!-- 🔼 ヘッダー -->
      <div class="chat-header">
        <span>{{ partnerDisplayName }}</span>
      </div>

      <!-- 🔽 メッセージ一覧 -->
<div
  class="message-list"
  @scroll.passive="handleScrollTop"
  ref="messageListRef"
>
<template v-for="msg in groupedMessages" :key="msg.id">
          <div v-if="msg.isDateSeparator" class="date-separator">
            {{ msg.date }}
          </div>

          <div
            v-else
            class="message-row"
            :class="{ mine: msg.senderSub === mySub }"
:id="`msg-${msg.id}`"          
>
            <!-- 💬 相手メッセージ -->
            <div v-if="msg.senderSub !== mySub">

<template v-if="msg.contentType === 'image'">
  <div class="message-wrapper text-with-time">
    <!-- ✅ 画像がロードされている場合 -->
    <img
      v-if="msg.imageUrl"
      :src="msg.imageUrl"
      class="message-image"
      :key="msg.imageUrl"
      @click="openImageModal(msg.imageUrl, msg.imageKey)"
      @load="onImageLoad"
    />

    <!-- ✅ imageKey があるが URL 未取得（🖼️ボタン） -->
    <div
      v-else-if="msg.imageKey"
      class="message-placeholder"
      @click="loadImageOnDemand(msg)"
    >
      🖼️
    </div>

    <!-- ❌ imageKey すらない異常データは何も表示しない -->

    <span class="timestamp-right">{{ formatTime(msg.timestamp) }}</span>

    <!-- ❤️ リアクション -->
    <div
      v-if="msg.reactions?.items?.length"
      :class="['reaction-display', msg.senderSub === mySub ? 'right-corner' : 'left-corner']"
    >
      <span v-for="r in msg.reactions.items" :key="r.id || r.emoji">{{ r.emoji }}</span>
    </div>
  </div>
</template>

<template v-else>
  <div class="message-wrapper text-with-time">
    <div
      class="message"
      @touchstart="startLongPress(msg.id)"
      @touchend="cancelLongPress"
      @mousedown="startLongPress(msg.id)"
      @mouseup="cancelLongPress"
      @mouseleave="cancelLongPress"
    >
      <div v-html="msg.content.replace(/\n/g, '<br>')"></div>
    </div>

    <!-- 🕒 吹き出しの右に時間 -->
    <span class="timestamp-right">{{ formatTime(msg.timestamp) }}</span>

    <!-- 🖼️ リアクション表示 -->
    <div v-if="msg.reactions?.items?.length" class="reaction-display over">
      <span v-for="r in msg.reactions.items" :key="r.id || r.emoji">{{ r.emoji }}</span>
    </div>
  </div>
</template>
            </div>

<!-- ✅ 自分のメッセージ -->
<template v-else>
  <span class="timestamp-side">{{ formatTime(msg.timestamp) }}</span>

  <div class="message-wrapper mine">
    <!-- ✅ 画像メッセージ -->
    <template v-if="msg.contentType === 'image'">
      <template v-if="msg.imageUrl">
        <img
          :src="msg.imageUrl"
          class="message-image"
          :key="msg.imageUrl"
          @click="openImageModal(msg.imageUrl, msg.imageKey)"
          @load="onImageLoad"
        />
      </template>
      <template v-else-if="msg.imageKey">
        <div
          class="message-placeholder"
          @click="loadImageOnDemand(msg)"
        >
          🖼️
        </div>
      </template>
    </template>

    <!-- ✅ テキストメッセージ -->
    <template v-else>
      <div class="message mine">
        <div v-html="msg.content.replace(/\n/g, '<br>')"></div>
      </div>
    </template>

    <!-- ✅ リアクション -->
    <div
      v-if="msg.reactions?.items?.length"
      :class="['reaction-display', msg.mine ? 'right-corner' : 'left-corner']"
    >
      <span v-for="r in msg.reactions.items" :key="r.id || r.emoji">
        {{ r.emoji }}
      </span>
    </div>
  </div>
</template>

            <!-- 🎉 リアクションピッカー -->
<div
  v-if="showReactionPickerFor === msg.id && msg.senderSub !== mySub"
  class="reaction-picker"
>
  <!-- ✅ 📋 コピーアイコン -->
  <span @click.stop="copyToClipboard(msg.content)">📋</span>

  <!-- 他のリアクション -->
  <span
    v-for="emoji in ['❤️','😆','😢','😮','🥰']"
    :key="emoji"
    @click="selectReaction(emoji, msg)"
  >
    {{ emoji }}
  </span>
</div>
          </div>
        </template>

        <div ref="bottomOfChat"></div>
      </div>

      <!-- ✨ エフェクト -->
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
import { updateChatRoom, createMessage } from '@/graphql/mutations'
import { onCreateMessage } from '@/graphql/subscriptions'
import { useRoute } from 'vue-router'
import ChatEffect from '@/components/ChatEffect.vue'
import PhotoPickerModal from '@/components/PhotoPickerModal.vue'
import PhotoPickerPanel from '@/components/PhotoPickerPanel.vue'
import ImagePreviewModal from '@/components/ImagePreviewModal.vue'
import { listMessages, publicProfileByYamatoId } from '@/graphql/queries'
import { createReaction } from '@/graphql/mutations'
import { deleteReaction as deleteReactionMutation } from '@/graphql/mutations'

const showImageModal = ref(false)
const previewImageUrl = ref('')
const previewImageKey = ref('')
const copiableMessageId = ref(null)

const selectedMessageId = ref(null)
const showReactionPicker = ref(false)
const reactionTargetMessage = ref(null)

const suppressAutoScroll = ref(false)
const isRestoringScroll = ref(false)


const loadedImageCount = ref(0)
const imageCount = ref(0) 

const pendingScrollRestore = ref(null) 


let reactionSubscription = null

function handleLongPress(message) {
  reactionTargetMessage.value = message
  showReactionPicker.value = true
}

let pressTimer = null

function startPressTimer(callback) {
  clearTimeout(pressTimer)
  pressTimer = setTimeout(() => {
    callback()
  }, 600)
}


function clearPressTimer() {
  clearTimeout(pressTimer)
}

// 差し替え：showToast を alert にするだけ
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        copiableMessageId.value = null
        alert('コピーしました') // ← 一時対応
      })
      .catch(() => {
        fallbackCopyToClipboard(text)
      })
  } else {
    fallbackCopyToClipboard(text)
  }
}

function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const success = document.execCommand('copy')
    if (success) {
      alert('コピーしました（互換）')
    } else {
      alert('コピーできませんでした')
    }
  } catch (err) {
    console.error(err)
    alert('コピーに失敗しました')
  }

  document.body.removeChild(textarea)
}

async function selectReaction(emoji, msg) {
  const user = await Auth.currentAuthenticatedUser()
  const mySub = user.attributes.sub

  // すでに同じリアクションをつけているか判定
  const existing = msg.reactions?.items?.find(r => r.reactorSub === mySub)

  if (existing && existing.emoji === emoji) {
    // ✅ 同じなら削除
    await deleteReaction(existing.id)
    msg.reactions.items = msg.reactions.items.filter(r => r.id !== existing.id)
  } else {
    // ✅ 上書き: まず削除
    if (existing) {
      await deleteReaction(existing.id)
      msg.reactions.items = msg.reactions.items.filter(r => r.id !== existing.id)
    }

    // 追加
    const result = await API.graphql(graphqlOperation(createReaction, {
      input: {
        messageId: msg.id,
        emoji,
        reactorSub: mySub,
        reactorYamatoId: user.attributes['custom:yamatoId'] || '匿名'
      }
    }))

    const newReaction = result.data?.createReaction
    if (newReaction) {
      if (!msg.reactions) msg.reactions = { items: [] }
      msg.reactions.items.push(newReaction)
    }
  }

  // ✅ ピッカーは閉じる
  showReactionPickerFor.value = null
}

async function reactToMessage(emoji) {
  const user = await Auth.currentAuthenticatedUser()
  await API.graphql(graphqlOperation(createReaction, {
    input: {
      messageId: props.message.id,
      emoji,
      reactorSub: user.attributes.sub,
      reactorYamatoId: user.attributes['custom:yamatoId'] || '匿名'
    }
  }))
  showPicker.value = false
}

async function loadImageOnDemand(msg) {
  if (msg.imageUrl) return // すでに取得済みなら何もしない

  try {
    const key = msg.thumbnailKey || msg.imageKey
    const url = await Storage.get(key, { level: 'public' })
    msg.imageUrl = url
  } catch (e) {
    console.warn('❌ 画像個別取得失敗:', msg.imageKey, e)
  }
}

function subscribeToNewReactions() {
  reactionSubscription = API.graphql(graphqlOperation(onCreateReaction)).subscribe({
    next: ({ value }) => {
      const newReaction = value?.data?.onCreateReaction
      if (!newReaction?.messageId) return

      const targetMsg = messages.value.find(m => m.id === newReaction.messageId)
      if (!targetMsg) return

      // リアクションが未定義なら初期化
      if (!targetMsg.reactions) {
        targetMsg.reactions = { items: [] }
      }

      // 同じ sender がすでにリアクションを持っているなら置き換え
      const existingIndex = targetMsg.reactions.items.findIndex(
        r => r.senderSub === newReaction.senderSub
      )

      if (existingIndex !== -1) {
        targetMsg.reactions.items.splice(existingIndex, 1, newReaction)
      } else {
        targetMsg.reactions.items.push(newReaction)
      }
    },
    error: err => console.error('❌ リアクションサブスクリプションエラー:', err)
  })
}
function subscribeToReactions() {
  reactionSubscription = API.graphql(graphqlOperation(onCreateReaction)).subscribe({
    next: ({ value }) => {
      const newReaction = value?.data?.onCreateReaction
      if (!newReaction?.messageId) return

      // 対象のメッセージを探して反映
      const msgIndex = messages.value.findIndex(m => m.id === newReaction.messageId)
      if (msgIndex !== -1) {
        const msg = messages.value[msgIndex]

        // 既に reactions.items があるか確認
        if (!msg.reactions || !msg.reactions.items) {
          msg.reactions = { items: [] }
        }

        // 重複チェック（同じ reactorSub の絵文字は上書き）
        const existing = msg.reactions.items.findIndex(r => r.reactorSub === newReaction.reactorSub)
        if (existing !== -1) {
          msg.reactions.items.splice(existing, 1, newReaction)
        } else {
          msg.reactions.items.push(newReaction)
        }

        // 再描画のために Vue に通知
        messages.value.splice(msgIndex, 1, { ...msg })
      }
    },
    error: (err) => console.error('❌ リアクションサブスクエラー:', err)
  })
}

const showReactionPickerFor = ref(null)
let longPressTimer = null

function startLongPress(messageId) {
  longPressTimer = setTimeout(() => {
    showReactionPickerFor.value = showReactionPickerFor.value === messageId ? null : messageId
    copiableMessageId.value = messageId // ✅ これを追加
  }, 500)
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}


async function deleteReaction(reactionId) {
  try {
    await API.graphql(graphqlOperation(deleteReactionMutation, {
      input: { id: reactionId }
    }))
  } catch (e) {
    console.error('❌ リアクション削除失敗:', e)
  }
}

const onCreateReaction = /* GraphQL */ `
  subscription OnCreateReaction {
    onCreateReaction {
      id
      messageId
      emoji
      reactorSub
      reactorYamatoId
      createdAt
    }
  }
`

const messagesByRoomIdQuery = /* GraphQL */ `
  query MessagesByRoomId(
    $roomId: ID!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    messagesByRoomId(
      roomId: $roomId
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        roomId
        senderSub
        content
        contentType
        imageKey
        timestamp
        createdAt
        reactions {
          items {
            id
            emoji
            reactorSub
            reactorYamatoId
          }
        }
      }
      nextToken  # ✅ これを必ず追加！
    }
  }
`

function onImageLoad() {
  loadedImageCount.value++

  if (
    imageCount.value > 0 &&
    loadedImageCount.value >= imageCount.value &&
    pendingScrollRestore.value &&
    messageListRef.value
  ) {
    const list = messageListRef.value
    const { anchorId } = pendingScrollRestore.value
    pendingScrollRestore.value = null

    suppressAutoScroll.value = false

    nextTick(() => {
      requestAnimationFrame(() => {
        const anchorEl = document.getElementById(anchorId)
        if (anchorEl) {
          anchorEl.scrollIntoView({ block: 'start' })
        }
      })
    })
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
    console.log('📥 受信 photo:', photo)

    // ✅ ここで previewUrl と thumbPreviewUrl を正しく拾う
    const preview = photo.previewUrl || photo.thumbPreviewUrl || ''

    if (!photo || !photo.imageKey || !photo.thumbnailKey) {
      console.warn('⚠️ 不正な photo オブジェクト:', photo)
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
      imageUrl: preview,
      isTemporary: true,
    }

    console.log('✅ 仮メッセージ追加:', tempMessage)

    messages.value.push(tempMessage)

    try {
      await sendImageMessage(photo.imageKey, photo.thumbnailKey)

      const finalUrl = await tryGetUrl(photo.thumbnailKey)
      const msg = messages.value.find(m => m.id === tempId)
      if (msg && finalUrl) msg.imageUrl = finalUrl
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
    await API.graphql(graphqlOperation(createMessage, { input }))

    await API.graphql(graphqlOperation(updateChatRoom, {
      input: {
        id: roomId.value,
        lastMessage: '📷 Photo',
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


watch(groupedMessages, async () => {
  if (suppressAutoScroll.value) return
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


onMounted(async () => {
  await nextTick()
  scrollToBottom()

  const user = await Auth.currentAuthenticatedUser()
  mySub.value = user.attributes.sub

  // 🔽 自分の Yamato ID を取得
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

  // 🔽 相手のプロフィール取得
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

  // ✅ メッセージ取得
  await fetchMessages()

  // ✅ サブスク開始（メッセージ + リアクション）
  subscribeToNewMessages()
  subscribeToNewReactions() // ← 追加！

  // ✅ 初回スクロール調整など
  loadedImageCount.value = 0
  await nextTick()

  if (imageCount.value === 0) {
    scrollToBottom(true)
  }
})

onBeforeUnmount(() => {
  if (subscription) subscription.unsubscribe()
  if (reactionSubscription) reactionSubscription.unsubscribe()
})



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


async function fetchMessages() {
  try {
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
    }

    console.log('📡 初回メッセージ取得開始 for roomId:', roomId.value)

    const res = await API.graphql(graphqlOperation(messagesByRoomIdQuery, {
      roomId: roomId.value,
      sortDirection: "DESC",
      limit: 30
    }))

    const items = res.data.messagesByRoomId.items || []
    nextToken = res.data.messagesByRoomId.nextToken
    console.log('📦 初回取得:', items.length, '📍nextToken:', nextToken)

    const sorted = items
      .filter(msg => !!msg)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const enriched = await Promise.all(sorted.map(async msg => {
      if (msg.contentType === 'image' && msg.imageKey) {
        const msgDate = new Date(msg.timestamp)
        const now = new Date()
        const daysDiff = (now - msgDate) / (1000 * 60 * 60 * 24)

        if (daysDiff <= 14) {
          try {
            const thumbKey = msg.thumbnailKey || msg.imageKey
            const url = await Storage.get(thumbKey, { level: 'public' })
            return { ...msg, imageUrl: url }
          } catch {
            return { ...msg, imageUrl: null }
          }
        } else {
          return { ...msg, imageUrl: null } // 🔕 古い画像は表示しない
        }
      }
      return msg
    }))

    messages.value = enriched
    console.log('✅ 初回格納:', enriched.length)

    await nextTick()
    scrollToBottom()

    subscribeToNewMessages()
  } catch (err) {
    console.error('❌ メッセージ取得エラー:', JSON.stringify(err, null, 2))
  }
}

let nextToken = null
const messageIds = new Set()

async function fetchMoreMessages() {
  try {
    if (!nextToken || !messageListRef.value) return

    suppressAutoScroll.value = true
    const list = messageListRef.value

    console.log('🔄 過去メッセージ取得 nextToken:', nextToken)

    // 取得前のスクロール位置を保存
    const prevScrollTop = list.scrollTop
    const prevScrollHeight = list.scrollHeight

    const res = await API.graphql(graphqlOperation(messagesByRoomIdQuery, {
      roomId: roomId.value,
      sortDirection: "DESC",
      limit: 30,
      nextToken
    }))

    const newItems = res.data.messagesByRoomId.items || []
    nextToken = res.data.messagesByRoomId.nextToken

    const sorted = newItems
      .filter(msg => !!msg && !messageIds.has(msg.id))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const enriched = sorted.map(msg => {
      messageIds.add(msg.id)
      if (msg.contentType === 'image' && msg.imageKey) {
        return { ...msg, imageUrl: null }
      }
      return msg
    })

    if (enriched.length === 0) {
      suppressAutoScroll.value = false
      return
    }

    // 🔼 古いメッセージを前方に追加
    messages.value = [...enriched, ...messages.value]

    await nextTick()

    // ✅ 差分スクロール：スクロール位置を維持するためにずらす
    const newScrollHeight = list.scrollHeight
    const diff = newScrollHeight - prevScrollHeight
    list.scrollTop = prevScrollTop + diff

    suppressAutoScroll.value = false
  } catch (err) {
    console.error('❌ fetchMoreMessages エラー:', JSON.stringify(err, null, 2))
    suppressAutoScroll.value = false
  }
}

 


const messageListRef = ref(null)

function handleScrollTop() {
  const el = messageListRef.value
  if (el && el.scrollTop === 0) {
    console.log('⬆️ スクロール先頭 - 追加取得')
    fetchMoreMessages()
  }
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

        // ✅ 仮メッセージ（isTemporary: true）置き換えロジック
        const existingIndex = messages.value.findIndex(
          m => m.imageKey === newMsg.imageKey && m.isTemporary
        )

        if (existingIndex !== -1) {
          // ✅ 仮メッセージを正式メッセージで置き換える
          messages.value.splice(existingIndex, 1, enrichedMsg)
        } else {
          // ✅ id 重複チェック
          const exists = messages.value.findIndex(m => m.id === newMsg.id) !== -1
          if (!exists) {
            messages.value.push(enrichedMsg)
          }
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
  if (suppressAutoScroll.value) {
    console.log('🚫 scrollToBottom suppressed')
    suppressAutoScroll.value = false
    return
  }

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
  position: relative; 
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

.text-with-time {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
}

.timestamp-right {
  font-size: 0.75rem;
  color: #aaa;
  margin-left: 0.6rem; /* ← 時計とリアクションの干渉防止 */
  white-space: nowrap;
  align-self: flex-end;
}

.image-wrapper.text-with-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
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
  /* text-align: right; ← ⭐️ これを削除する */
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
  max-width: min(80vw, 520px);
}

/* 👤 相手のメッセージ → 選択不可 */
.message:not(.mine) {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
}

.message.mine {
  user-select: text;
  -webkit-user-select: text;

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

.reaction-picker {
  position: absolute;
  top: -2rem;
  right: -0.5rem; /* ✅ 吹き出し右端を基準に内側に配置 */
  display: flex;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 0.4rem 0.6rem;
  font-size: 1.3rem;
  z-index: 10;
  white-space: nowrap;
}

.reaction-display {
  position: absolute;
  top: -0.6rem;
  right: -0.6rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  padding: 0.2rem 0.4rem;
  font-size: 1rem;
  display: flex;
  gap: 0.3rem;
  pointer-events: none;
  z-index: 5;
}
.message-wrapper {
  position: relative;
  display: inline-block;

  /* 🛡️ wrapper側にも防止を追加 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* ✨ リアクション：上に一時表示（ピッカー表示時などに使う） */
.reaction-display.over {
  position: absolute;
  top: -0.4rem;
  right: 1.7rem; /* ✅ ここをマイナスからプラスへ */
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  padding: 0;
  font-size: 1rem;
  display: flex;
  gap: 0.3rem;
  pointer-events: none;
  z-index: 10;
  box-shadow: none;
}

/* ✅ 通常のリアクション表示 */
.reaction-display {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  white-space: nowrap;
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  padding: 0;
  font-size: 1rem;
}

/* 🎯 相手からのメッセージ用（左上） */
.left-corner {
  left: -0.6rem;
  transform: none;
}

/* 🎯 自分のメッセージ用（右上） */
.right-corner {
  top: -0.6rem;
  right: 0.1rem; /* ← 時計には被らず、吹き出し右上にピッタリ重なる */
  transform: none;
}

/* 🎯 各リアクション絵文字：装飾を完全除去 */
.reaction-display span {
  display: inline-block;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  background: none;
  box-shadow: none;
  border-radius: 0;
  color: inherit;
}

.copy-button {
  position: absolute;
  top: -0.5rem;
  right: -1.2rem;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  padding: 0.2rem 0.4rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  z-index: 10;
}

.message-placeholder {
  width: 120px;
  height: 120px;
  background-color: #eee;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
}

</style>
