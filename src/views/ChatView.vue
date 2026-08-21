<template>
  <div class="view-wrapper" @click="handleOuterClick">
    <div class="chat-container">
      <!-- 🕸️ ヘッダー -->
      <div class="chat-header">
        <span>{{ partnerDisplayName }}</span>
      </div>

      <!-- 🗳️ メッセージ一覧 -->
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
    <div class="image-wrapper">
      <img
        v-if="msg.imageUrl"
        :src="msg.imageUrl"
        class="message-image"
        :key="msg.imageUrl"
        @click="openImageModal(msg.imageUrl, msg.imageKey)"
        @load="onImageLoad"
      />
      <div
        v-else-if="msg.imageKey"
        class="message-placeholder"
        @click="loadImageOnDemand(msg)"
      >
        🖼️
      </div>
    </div>

    <!-- ⏰ タイムスタンプ -->
    <span class="timestamp-right">{{ formatTime(msg.timestamp) }}</span>

    <!-- ❤️ リアクション -->
    <div
      v-if="msg.reactions?.items?.length"
      :class="['reaction-display', 'left-corner']"
    >
      <span v-for="r in msg.reactions.items" :key="r.id || r.emoji">
        {{ r.emoji }}
      </span>
    </div>
  </div>
</template>

              <template v-else-if="isSingleEmoji(msg.content)">
                <div class="message-wrapper text-with-time">
                  <div class="emoji-only">{{ msg.content }}</div>
                  <span class="timestamp-right">{{ formatTime(msg.timestamp) }}</span>
                </div>
              </template>

              <template v-else>
                <div class="message-wrapper text-with-time">
<div
  class="message"
  @touchstart="isMobile ? startLongPress(msg.id) : null"
  @touchend="isMobile ? cancelLongPress() : null"
  @mousedown="!isMobile ? null : startLongPress(msg.id)"
  @mouseup="!isMobile ? null : cancelLongPress()"
  @mouseleave="!isMobile ? null : cancelLongPress()"
  @dblclick="!isMobile && handleDesktopDoubleClick(msg.id)"
>
 <div v-html="linkify(msg.content)"></div>
                  </div>
                  <span class="timestamp-right">{{ formatTime(msg.timestamp) }}</span>

                  <div v-if="msg.reactions?.items?.length" class="reaction-display over">
                    <span v-for="r in msg.reactions.items" :key="r.id || r.emoji">{{ r.emoji }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- 自分のメッセージ -->
            <template v-else>
              <span class="timestamp-side">{{ formatTime(msg.timestamp) }}</span>

              <template v-if="msg.contentType === 'image'">
                <div class="image-wrapper mine">
                  <img
                    v-if="msg.imageUrl"
                    :src="msg.imageUrl"
                    class="message-image"
                    :key="msg.imageUrl"
                    @click="openImageModal(msg.imageUrl, msg.imageKey)"
                    @load="onImageLoad"
                  />
<div
  v-else-if="msg.imageKey"
  class="message-placeholder"
  @click="loadImageOnDemand(msg)"
>
  <div class="image-loader">
    <span class="spinner-ring" />
    <span class="image-icon">🖼️</span>
  </div>
</div>
                </div>
              </template>

              <template v-else-if="isSingleEmoji(msg.content)">
                <div class="emoji-only mine">{{ msg.content }}</div>
              </template>

              <template v-else>
                <div class="message-wrapper mine">
                  <div class="message mine">
<div v-html="linkify(msg.content)"></div>
                  </div>

                  <div
                    v-if="msg.reactions?.items?.length"
                    :class="[
                      'reaction-display',
                      msg.mine ? 'right-corner' : 'left-corner',
                      msg._animate ? 'reaction-emoji-animate' : ''
                    ]"
                  >
                    <span v-for="r in msg.reactions.items" :key="r.id || r.emoji">
                      {{ r.emoji }}
                    </span>
                  </div>
                </div>
              </template>
            </template>

            <!-- 🎉 リアクションピッカー -->
            <div
              v-if="showReactionPickerFor === msg.id && msg.senderSub !== mySub"
              ref="reactionPickerRef"
              class="reaction-picker"
              @click.stop
            >
              <div class="emoji-list">
                <span
  v-for="emoji in ['❤️','😆','🥺','😮','😂','🥰','😭','👍']"
                  :key="emoji"
                  @click="selectReaction(emoji, msg)"
                >
                  {{ emoji }}
                </span>
              </div>
              <span class="copy-icon" @click.stop="copyToClipboard(msg.content)">📋</span>
            </div>
          </div>
        </template>

        <div ref="bottomOfChat"></div>
      </div>

      <!-- ✨ エフェクト -->
      <ChatEffect ref="chatEffect" />

      <!-- 🗳️ 入力栏 -->
      <div class="input-area">
        <button type="button" @click="openPhotoPicker" class="circle-button">🖼</button>
 <button type="button" class="circle-button" @click="triggerFileInput">📷</button>
  <input
    ref="fileInputRef"
    type="file"
    accept="image/*"
    @change="handleLocalImageUpload"
    style="display: none"
  />

        <textarea
          ref="textareaRef"
          v-model="newMessage"
          :placeholder="t('chat.inputPlaceholder')"
          rows="1"
          class="message-input"
          @input="autoResize"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
          @focus="handleInputFocus"
        ></textarea>
        <button
          type="button"
          class="circle-button"
          :class="{ shake: isShaking }"
          :disabled="isSendButtonDisabled"
          @mousedown.prevent="handleSendClick"
          @touchstart.prevent="handleSendClick"
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
import { useChatEffects } from '@/composables/useChatEffects'


import { useI18n } from 'vue-i18n'
const isSubscribed = ref(false) // ✅ 追加


const { t } = useI18n()

const userSettings = ref({})

const showImageModal = ref(false)
const previewImageUrl = ref('')
const previewImageKey = ref('')
const copiableMessageId = ref(null)

const selectedMessageId = ref(null)
const showReactionPicker = ref(false)
const reactionTargetMessage = ref(null)
const reactionPickerRef = ref(null) 

const suppressAutoScroll = ref(false)
const isRestoringScroll = ref(false)


const loadedImageCount = ref(0)
const imageCount = ref(0) 


const pendingScrollRestore = ref(null)

 
const chatEffect = ref(null)
const messageAnimationEnabled = ref(true)
const messageEffectEnabled = userSettings.value?.messageEffectEnabled ?? true

const { maybePlayEffect } = useChatEffects(chatEffect, messageAnimationEnabled)


const fileInputRef = ref(null)

function triggerFileInput() {
  textareaRef.value?.blur();
  setTimeout(() => {
    window.scrollTo(0, document.body.scrollHeight);
    fileInputRef.value?.click();
  }, 50); // OS がフォーカスを外す直前に合わせる
}

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


function isSingleEmoji(text) {
  const trimmed = text.trim()
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u
  return emojiRegex.test(trimmed)
}


function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        copiableMessageId.value = null
        alert(t('common.copySuccess')) // ✅ ローカライズ
      })
      .catch(() => {
        alert(t('common.copyFailed')) // ❌ ローカライズ
      })
  } else {
    alert(t('common.copyFailed'))
  }
}

async function selectReaction(emoji, msg) {
  const user = await Auth.currentAuthenticatedUser()
  const mySub = user.attributes.sub

  const existing = msg.reactions?.items?.find(r => r.reactorSub === mySub)

  if (existing && existing.emoji === emoji) {
    // 👇 リアクション削除
    await deleteReaction(existing.id)
    msg.reactions.items = msg.reactions.items.filter(r => r.id !== existing.id)
  } else {
    // 👇 同じ人の前のリアクション削除（上書き）
    if (existing) {
      await deleteReaction(existing.id)
      msg.reactions.items = msg.reactions.items.filter(r => r.id !== existing.id)
    }

    // 👇 新しいリアクション登録
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

      // ✅ アニメーション発火のための工夫
      msg._animate = false
      await nextTick()
      msg._animate = true

      // ⏱️ アニメーション終了でリセット（500ms 後）
      setTimeout(() => {
        msg._animate = false
      }, 500)
    }
  }

  // 👇 ピッカー閉じる
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
    previewImageUrl.value = thumbnailUrl
    previewImageKey.value = fullKey // ✅ fallback 用にも key を渡す
  } finally {
    showImageModal.value = true
  }
}

const textareaRef = ref(null)
const isComposing = ref(false)
const bottomOfChat = ref(null)

const partnerDisplayName = ref('')
const messages = ref([])
const newMessage = ref('')

// 🔐 下書き保存キー
const DRAFT_KEY = 'chat_draft_message'

// ✍️ 入力中の内容を常に保存
watch(newMessage, (val) => {
  if (val && val.trim() !== '') {
    localStorage.setItem(DRAFT_KEY, val)
  } else {
    localStorage.removeItem(DRAFT_KEY)
  }
})

const myYamatoId = ref('')
const mySub = ref('')
const roomId = ref('')
const receiverYamatoId = ref('')
const receiverSub = ref('')
const showPhotoPicker = ref(false)
const isMobile = ref(false)


const isJapaneseInput = ref(false)

function handleCompositionStart(e) {
  isComposing.value = true
  isJapaneseInput.value = /[ぁ-んァ-ン]/.test(e.data || '')
}

const forceUpdateTrigger = ref(0)

function handleCompositionEnd() {
  isComposing.value = false
  isJapaneseInput.value = false

  nextTick(() => {
    forceUpdateTrigger.value++  // 🔁 再評価を明示
  })
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

  receiverSub.value = params.receiverSub || ''

  receiverYamatoId.value = params.receiverYamatoId || ''

})

watch(groupedMessages, async () => {
  if (suppressAutoScroll.value) return
  await nextTick()
  scrollToBottom()
})


watch(messages, () => {
  const lastMsg = messages.value[messages.value.length - 1]
  if (!lastMsg || lastMsg.senderSub === mySub.value) return
  if (messageAnimationEnabled.value) {
    maybePlayEffect(lastMsg.content)
  }
})



function handleOuterClick(event) {
  const target = event.target

  const isClickInsideTextarea = textareaRef.value?.contains(target)
  const isClickInsidePicker = reactionPickerRef.value?.contains?.(target)

  if (isClickInsideTextarea || isClickInsidePicker) {
    return
  }

  // 外側をクリックしたら閉じる
  showReactionPickerFor.value = null
  dismissKeyboard()
}

// 送信ボタンの活性化条件（空白のみなら非活性）
const isSendButtonDisabled = computed(() => {
  return newMessage.value.trim() === ''
})

function hideKeyboard() {
  const el = document.activeElement
  if (el && typeof el.blur === 'function') el.blur()
}


onMounted(async () => {

// ♻️ 下書き復元（iOS Safari対策）
const draft = localStorage.getItem(DRAFT_KEY)
if (draft) {
  newMessage.value = draft
}
  // ✅ 1. 認証ユーザーの取得と基本情報
  const user = await Auth.currentAuthenticatedUser()
  mySub.value = user.attributes.sub
  const animSetting = user.attributes['custom:message_animation']
  messageAnimationEnabled.value = animSetting !== 'off' // undefined も true 扱い

  // ✅ 2. 自分の Yamato ID を取得
const myProfileRes = await API.graphql({

  query: /* GraphQL */ `

    query GetMyWeatherProfile($id: ID!) {

      getWeatherProfile(id: $id) {

        nickname

      }

    }

  `,

  variables: {

    id: mySub.value

  },

  authMode: 'AMAZON_COGNITO_USER_POOLS'

})

myYamatoId.value =

  myProfileRes.data?.getWeatherProfile?.nickname || ''

  // ✅ 3. 相手のプロフィール取得
console.log('🔎 roomId:', roomId.value)

console.log('🔎 receiverYamatoId:', receiverYamatoId.value)

try {

  const profileRes = await API.graphql({

    query: /* GraphQL */ `

      query GetWeatherProfile($id: ID!) {

        getWeatherProfile(id: $id) {

          nickname

        }

      }

    `,

    variables: {

      id: receiverSub.value

    },

    authMode: 'AMAZON_COGNITO_USER_POOLS'

  })

  const profile = profileRes.data?.getWeatherProfile

  partnerDisplayName.value =

    profile?.nickname ||

    receiverYamatoId.value ||

    '相手'

} catch (error) {

  console.warn('⚠️ WeatherProfile取得失敗:', error)

  // プロフィール取得失敗だけでチャットを止めない

  partnerDisplayName.value =

    receiverYamatoId.value || '相手'

}

  // ✅ 4. メッセージ取得とサブスクリプション登録（fetchMessages 内で subscribe 呼ぶ）
  await fetchMessages()

  // ✅ 5. 初期スクロール位置調整（画像なしなら即スクロール）
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

const isShaking = ref(false)

const isSending = ref(false)

function handleSendClick(event) {
  if (!isSubscribed.value) {
    console.warn('🕓 サブスクリプションが完了していないため、送信を待機します')
    return
  }

  if (isSending.value) return // 🛑 すでに送信中なら無視

  // ✅ 変換中または直後で未確定文字の可能性があるときは送信させない
  if (isComposing.value || isJapaneseInput.value) {
    event?.preventDefault()
    event?.stopPropagation()

    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 300)

    setTimeout(() => {
      textareaRef.value?.focus()
    }, 0)
    return
  }

  if (!newMessage.value.trim()) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 300)
    return
  }

  isComposing.value = false
  isJapaneseInput.value = false

  // 🚫 ここで連打防止フラグON
  isSending.value = true

  // 🚀 実際の送信処理
  sendMessage()
    .then(() => {
      newMessage.value = ''
    })
    .finally(() => {
      isSending.value = false
    })
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
    // ✅ メッセージ作成
    await API.graphql(graphqlOperation(createMessage, { input }))

    // ✅ チャットルーム更新
    await API.graphql(graphqlOperation(updateChatRoom, {
      input: {
	id: roomId.value,
        lastMessage: content,
        lastContentType: 'text',
        lastTimestamp: now.toISOString(),
        lastSenderId: mySub.value,
        expiresAt
      }
    }))

    // ✅ 成功後処理
    newMessage.value = ''
localStorage.removeItem(DRAFT_KEY)
 
   await nextTick()

 if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }

    const triggered = maybePlayEffect(content)
    if (!triggered && textareaRef.value) {
      textareaRef.value.focus()
    }
  } catch (err) {
    // ✅ 詳細なエラーログ出力
    console.error('❌ メッセージ送信エラー:', err)

    if (err.errors && Array.isArray(err.errors)) {
      err.errors.forEach(e => {
        console.error('GraphQL Error:', e.message || e)
      })
    } else if (err.message) {
      console.error('Error message:', err.message)
    } else {
      console.error('Unknown error:', JSON.stringify(err, null, 2))
    }

    // UIフィードバックなどを追加するならここ
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


onMounted(() => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      localStorage.setItem(DRAFT_KEY, newMessage.value || '')
    }
  })
})

async function fetchMessages() {
  try {
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
    }

    const res = await API.graphql(graphqlOperation(messagesByRoomIdQuery, {
      roomId: roomId.value,
      sortDirection: "DESC",
      limit: 30
    }))

    const items = res.data.messagesByRoomId.items || []
    nextToken = res.data.messagesByRoomId.nextToken

    const sorted = items
      .filter(msg => !!msg)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // ✅ STEP 1: まずは imageUrl: null で代入
    messages.value = sorted.map(msg => ({
      ...msg,
      imageUrl: null
    }))

    await nextTick()
    scrollToBottom()

    // ✅ STEP 2: 遅延して画像を取得・差し替える
    setTimeout(() => {
      loadImageUrls(messages.value)
    }, 500) // 500ms ほど遅らせるのが自然です

    subscribeToNewMessages()
  } catch (err) {
    console.error('❌ メッセージ取得エラー:', JSON.stringify(err, null, 2))
  }
}

async function loadImageUrls(messageList) {
  const now = new Date()

  for (let msg of messageList) {
    if (msg.contentType === 'image' && msg.imageKey && msg.imageUrl === null) {
      const msgDate = new Date(msg.timestamp)
      const daysDiff = (now - msgDate) / (1000 * 60 * 60 * 24)

      if (daysDiff <= 14) {
        try {
          const thumbKey = msg.thumbnailKey || msg.imageKey
          const url = await Storage.get(thumbKey, { level: 'public' })
          msg.imageUrl = url
        } catch {
          msg.imageUrl = null
        }
      }
    }
  }

  // Vue の再描画を促す（必須）
  messages.value = [...messageList]
}

let nextToken = null
const messageIds = new Set()

async function fetchMoreMessages() {
  try {
    if (!nextToken || !messageListRef.value) return

    suppressAutoScroll.value = true
    const list = messageListRef.value

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

    // 追加は unshift
    messages.value.unshift(...enriched)

    await nextTick()

    // 👇 高さ確定を待ってから補正
    requestAnimationFrame(() => {
      const newScrollHeight = list.scrollHeight
      const diff = newScrollHeight - prevScrollHeight
      list.scrollTop = Math.max(0, prevScrollTop + diff)
      suppressAutoScroll.value = false
    })
  } catch (err) {
    console.error('❌ fetchMoreMessages エラー:', JSON.stringify(err, null, 2))
    suppressAutoScroll.value = false
  }
}
 


const messageListRef = ref(null)

function handleScrollTop() {
  const el = messageListRef.value
  if (!el) return

  // バウンスでマイナスになるのを無視する
  if (el.scrollTop >= 0 && el.scrollTop <= 20) {
    fetchMoreMessages()
  }
}

function subscribeToNewMessages() {
  subscription = API.graphql(graphqlOperation(onCreateMessage)).subscribe({
    next: async ({ value }) => {
      const newMsg = value?.data?.onCreateMessage
      if (!newMsg?.roomId) return

      if (newMsg.roomId === roomId.value) {
        let enrichedMsg = newMsg

        // 💬 画像の場合の処理...
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

        // ✅ 仮メッセージ置換または追加
        const existingIndex = messages.value.findIndex(
          m => m.imageKey === newMsg.imageKey && m.isTemporary
        )

        if (existingIndex !== -1) {
          messages.value.splice(existingIndex, 1, enrichedMsg)
          messages.value = [...messages.value] // ✅ 明示的に再描画を促す
        } else {
          const exists = messages.value.findIndex(m => m.id === newMsg.id) !== -1
          if (!exists) {
            messages.value = [...messages.value, enrichedMsg] // ✅ push の代わりに新インスタンス
          }
        }

        if (enrichedMsg.senderSub !== mySub.value && messageAnimationEnabled.value) {
          maybePlayEffect(enrichedMsg.content)
        }

        await nextTick()
        setTimeout(() => scrollToBottom(), 0)
      }
    },
    error: (err) => console.error('❌ サブスクリプションエラー:', err)
  })

  isSubscribed.value = true // ✅ 最後に完了を明示
}



function scrollToBottom(immediate = false, force = false) {
  if (suppressAutoScroll.value && !force) {
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

function groupMessagesByDate(messages) {
  const grouped = []
  let lastDate = null
  for (const msg of messages) {
    const d = new Date(msg.timestamp)
    const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`

    if (date !== lastDate) {
      grouped.push({ isDateSeparator: true, date })
      lastDate = date
    }
    grouped.push(msg)
  }
  return grouped
}

function handleInputFocus() {
  if (!isMobile.value || suppressAutoScroll.value) return

  let attempts = 0
  const adjust = () => {
    scrollToBottom(true, true)
    attempts++
    if (attempts >= 3) {
      window.visualViewport?.removeEventListener("resize", adjust)
    }
  }

  // キーボードが開くと resize が複数回走るので数回だけ追従
  window.visualViewport?.addEventListener("resize", adjust)

  // 保険：遅延で追加
  setTimeout(adjust, 700)
  setTimeout(adjust, 1200)
}

function dismissKeyboard() {
  const activeElement = document.activeElement
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur()
  }
}


function linkify(content) {
  if (!content) return ''
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[^\s]+\.(com|net|org|jp|io|dev|co)[^\s]*)/gi

  return content.replace(urlRegex, url => {
    const href = url.startsWith('http') ? url : `http://${url}`
    return `<a href="${href}" target="_blank" class="message-link">${url}</a>`
  }).replace(/\n/g, '<br>')
}

async function handleLocalImageUpload(event) {
  const start = performance.now()
  const file = event.target.files?.[0]
  if (!file) return

  const timestamp = Date.now()
  const fileName = `chat/${mySub.value}/${timestamp}_${file.name}`
  const thumbnailFileName = fileName.replace(/(\.\w+)$/, '_thumb$1')
  const now = new Date()
  const tempId = `temp-${now.getTime()}`

  const previewThumbUrl = URL.createObjectURL(file)
  // console.log('[🖼️ PREVIEW]', previewThumbUrl)

  messages.value.push({
    id: tempId,
    roomId: roomId.value,
    senderSub: mySub.value,
    senderYamatoId: myYamatoId.value,
    receiverSub: receiverSub.value,
    receiverYamatoId: receiverYamatoId.value,
    content: '',
    contentType: 'image',
    imageKey: fileName,
    thumbnailKey: thumbnailFileName,
    timestamp: now.toISOString(),
    thumbnailUrl: previewThumbUrl,
    isTemporary: true
  })

  await nextTick()
  scrollToBottom()

  try {
    const t1 = performance.now()
    // console.log('[⚙️ サムネイル生成中]')
    const thumbnailBlob = await createThumbnail(file)
    // console.log(`[⚙️ サムネイル生成完了] ${Math.round(performance.now() - t1)}ms`)

    const t2 = performance.now()
    await Storage.put(fileName, file, {
      level: 'public',
      contentType: file.type,
    })
    // console.log(`[✅ 本体アップロード完了] ${Math.round(performance.now() - t2)}ms`)

    const t3 = performance.now()
    await Storage.put(thumbnailFileName, thumbnailBlob, {
      level: 'public',
      contentType: thumbnailBlob.type,
    })
    // console.log(`[✅ サムネイルアップロード完了] ${Math.round(performance.now() - t3)}ms`)

    const t4 = performance.now()
    await sendImageMessage(fileName, thumbnailFileName)
    // console.log(`[✉️ メッセージ送信完了] ${Math.round(performance.now() - t4)}ms`)
  } catch (error) {
    // console.error('❌ 画像アップロード中にエラー:', error)
  } finally {
    URL.revokeObjectURL(previewThumbUrl)
    // console.log(`[⏱️ 合計所要時間] ${Math.round(performance.now() - start)}ms`)
  }
}

async function createThumbnail(file) {
  const img = new Image()
  const objectURL = URL.createObjectURL(file)
  img.src = objectURL

  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })

  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const aspect = img.width / img.height
  let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height

  if (aspect > 1) {
    sx = (img.width - img.height) / 2
    sWidth = sHeight = img.height
  } else {
    sy = (img.height - img.width) / 2
    sHeight = sWidth = img.width
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size)
  URL.revokeObjectURL(objectURL)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Thumbnail blob creation failed'))
      }
    }, 'image/jpeg', 0.8)
  })
}

function handleDesktopDoubleClick(messageId) {
  if (!isMobile.value) {
    showReactionPickerFor.value =
      showReactionPickerFor.value === messageId ? null : messageId
    copiableMessageId.value = messageId
  }
}

</script>

 



<style scoped>

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;                /* 親(view-wrapper)の高さいっぱいにする */
  background: #ffffff;
  color: #000;
  box-sizing: border-box;

  width: 100%;
  margin: 0 auto;
  max-width: 600px;       /* ✅ PC向け最大幅 */
  overflow: hidden;       /* 👈 window全体スクロールを防ぐ */
}

/* ✅ PC向けにmin-widthを追加 */
@media (min-width: 768px) {
  .chat-container {
    min-width: 600px;
  }
}
.view-wrapper {
  height: 100dvh;              /* iOS16+ */
  min-height: 100vh;           /* 古い環境 */
  display: flex;
  flex-direction: column;
}


button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.message-list {
  flex: 1;                          /* 親 flex に合わせて縦いっぱい */
  overflow-y: auto;                 /* 縦スクロールを有効化 */
  -webkit-overflow-scrolling: touch;/* iOS でスムーズスクロール */
  
  display: flex;
  flex-direction: column;

  padding: 1rem;
  margin: 0 auto;                   /* PC用に中央寄せ */
  max-width: 800px;                 /* PC用の最大幅制限 */
  width: 100%;

  height: 100%;                     /* 💡 高さを明示する */
  box-sizing: border-box;           /* padding込みで計算 */
}


.input-area {
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  border-top: 1px solid #333;
  gap: 0.4rem;

  /* iOS セーフエリア対応 */
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  position: sticky;
  bottom: 0;

  background-color: #fff;
  color: #000;

  margin: 0 auto;        
  max-width: 800px;	 
  width: 100%;
  overflow: hidden;

  /* 👇 少しだけ余白をつけて「被り」を防ぐ */
  margin-bottom: 6px; /* ← 調整用。4〜8pxが目安 */
}


/* 🌙 ダークモード */
@media (prefers-color-scheme: dark) {
  .input-area {
    background-color: #111;
    border-top: 1px solid #555;
    color: #fff;
  }

  .message-input {
    background-color: #222;
    border: 1px solid #444;
    color: #fff;
  }
}

/* 📱 スマホでは幅いっぱいにする */
@media (max-width: 768px) {
  .message-list,
  .input-area {
    max-width: none;
    margin: 0;
  }
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
  background-color: #fff; /* 通常モードでは白 */
  color: #000;
  overflow-y: auto;
  resize: none;
  max-height: 150px;
  min-height: 40px;
  transition: height 0.1s ease-out;
  box-sizing: border-box;
}
@media (prefers-color-scheme: dark) {
  .input-area {
    background-color: #111;
    border-top: 1px solid #555;
    color: #fff;
  }

  /* ✏️ 入力欄はグレー背景にする */
  .message-input {
    background-color: #333;   /* ← 濃いグレー */
    border: 1px solid #555;   /* 枠も少し明るめに */
    color: #fff;
  }
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
  width: 2.0rem !important;
  height: 2.0rem !important;
  font-size: 1.2rem;
  display: inline-flex;         /* 💡 PC時の拡張を抑制 */
  align-items: center;
  justify-content: center;
  margin-left: 0.4rem;
  cursor: pointer;
  flex: 0 0 auto;               /* 💡 完全固定にする */
  transition: background-color 0.2s ease;
}

.circle-button:disabled {
  background-color: #274c77;  /* 通常と同じ色 */
  color: white;
  opacity: 1;                 /* 半透明を防止 */
  cursor: default;            /* or keep as 'pointer' */
}


@keyframes shake {
  0% { transform: translateX(0); }
  10% { transform: translateX(-4px); }
  20% { transform: translateX(4px); }
  30% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  50% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}

.shake {
  animation: shake 0.6s ease;
}

.circle-button:disabled {
  background-color: #274c77 !important;
  color: white !important;
  opacity: 1 !important;
  cursor: default !important;
}

.circle-button:disabled:hover {
  background-color: #274c77 !important;
  color: white !important;
  opacity: 1 !important;
  cursor: default !important;
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


.emoji-list {
  display: flex;
  gap: 0.4rem;
}

.copy-icon {
  margin-left: auto;
  cursor: pointer;
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

.image-wrapper {
  width: 220px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

/* 一時的な画像（例：アップロード中） */
.message-image.temp {
  opacity: 0.4;
  filter: blur(1px);
}

.message-placeholder {
  width: 100%;
  height: 100%;
  background-color: #eee;
  border-radius: 10px;
  font-size: 2rem;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.message a {
  color: #3366cc;
  text-decoration: underline;
  word-break: break-word;
}

.emoji-only {
  font-size: 3.5rem;
  line-height: 1;
  display: inline-block;
  background: transparent;
  box-shadow: none;
  padding: 0;
  margin: 0.1em 0;
  animation: emojiWobble 3s ease-in-out infinite alternate; /* ← 3sに変更 */
  vertical-align: middle;
}

.emoji-only.mine {
  align-self: flex-end;
  text-align: right;
}

/* ゆっくりゆらゆらアニメーション */
@keyframes emojiWobble {
  0%   { transform: translateY(0px) rotate(0deg); }
  50%  { transform: translateY(-2px) rotate(-4deg); }
  100% { transform: translateY(0px) rotate(4deg); }
}

.message-link {
  color: #007aff;
  text-decoration: underline;
  word-break: break-word;
}

.image-loader {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-icon {
  font-size: 24px;
  z-index: 2;
}

.spinner-ring {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 3px solid #ccc;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>

