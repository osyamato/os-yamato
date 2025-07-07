<template>
  <div class="chat-room-list">
    <!-- 🔷 ヘッダー -->
    <transition name="dropDown" v-if="shouldAnimate">
      <div class="chat-header" v-if="isReady">
        <h2 class="header-title">{{ t('chat.title') }}</h2>
        <div class="header-icons">
          <IconButton :color="iconColor" @click="openProfileModal">{{ myInitial }}</IconButton>
          <IconButton v-if="hasProfile" :color="iconColor" :class="{ blink: hasIncomingRequest }" @click="handleRequestClick">📮</IconButton>
          <IconButton v-if="hasProfile" :color="iconColor" @click="openSearchModal">🔍</IconButton>
<IconButton v-if="hasProfile" :color="iconColor" @click="openSentWindMessages">
  🕊️
</IconButton>
        </div>
      </div>
    </transition>

    <div class="chat-header" v-else-if="isReady">
      <h2 class="header-title">{{ t('chat.title') }}</h2>
      <div class="header-icons">
        <IconButton :color="iconColor" @click="openProfileModal">{{ myInitial }}</IconButton>
        <IconButton v-if="hasProfile" :color="iconColor" :class="{ blink: hasIncomingRequest }" @click="handleRequestClick">📮</IconButton>
        <IconButton v-if="hasProfile" :color="iconColor" @click="openSearchModal">🔍</IconButton>
<IconButton v-if="hasProfile" :color="iconColor" @click="openSentWindMessages">🕊️</IconButton>
      </div>
    </div>

    <!-- 🔷 チャットリスト -->
    <transition name="dropDownList" v-if="shouldAnimate">
      <div class="room-list" v-if="isReady">
        <div
          v-for="room in sortedRooms"
          :key="room.id"
          class="room-card"
          @click="goToRoom(room.id, getPartnerYamatoId(room))"
        >
          <div class="partner-name">
            <div class="left-group">
              <span class="icon">{{ getExpiryIcon(room) }}</span>
              <span class="name-text">
                {{
                  getPartnerDisplayName(room).length > 15
                    ? getPartnerDisplayName(room).slice(0, 15) + '…'
                    : getPartnerDisplayName(room)
                }}
              </span>
            </div>
            <div class="menu-group">
              <span class="menu-dots" @click.stop="openOptions(room)">⋯</span>
              <span class="mail-icon" @click.stop="openWindMessage(room)">✉️</span>
            </div>
          </div>
          <p class="last-message">
            <span v-if="hasUnread(room)" class="unread-dot inline"></span>
            <span class="message-text">
              {{
                room.lastContentType === 'image'
                  ? t('chat.photo')
                  : room.lastMessage
                    ? room.lastMessage.length > 15
                      ? room.lastMessage.slice(0, 15) + '…'
                      : room.lastMessage
                    : ''
              }}
            </span>
          </p>
          <small class="last-time">{{ formatTime(room.lastTimestamp) }}</small>
        </div>
      </div>
    </transition>

    <!-- fallback list (非アニメーション) -->
    <div class="room-list" v-else-if="isReady">
      <div
        v-for="room in sortedRooms"
        :key="room.id"
        class="room-card"
        @click="goToRoom(room.id, getPartnerYamatoId(room))"
      >
        <div class="partner-name">
          <div class="left-group">
            <span class="icon">{{ getExpiryIcon(room) }}</span>
            <span class="name-text">
              {{
                getPartnerDisplayName(room).length > 15
                  ? getPartnerDisplayName(room).slice(0, 15) + '…'
                  : getPartnerDisplayName(room)
              }}
            </span>
          </div>
          <div class="menu-group">
            <span class="menu-dots" @click.stop="openOptions(room)">⋯</span>
            <span class="mail-icon" @click.stop="openWindMessage(room)">✉️</span>
          </div>
        </div>
        <p class="last-message">
          <span v-if="hasUnread(room)" class="unread-dot inline"></span>
          <span class="message-text">
            {{
              room.lastContentType === 'image'
                ? t('chat.photo')
                : room.lastMessage
                  ? room.lastMessage.length > 15
                    ? room.lastMessage.slice(0, 15) + '…'
                    : room.lastMessage
                  : ''
            }}
          </span>
        </p>
        <small class="last-time">{{ formatTime(room.lastTimestamp) }}</small>
      </div>
    </div>

    <!-- 🔷 モーダル -->
    <YamatoUserSearchModal v-if="showModal" :onClose="() => showModal = false" />
    <transition name="modal">
      <Modal
        v-if="showRequestModal"
        :visible="true"
        customClass="compact"
        @close="() => showRequestModal = false"
      >
        <div>
          <h3 class="modal-title">{{ t('chat.newConversationRequest') }}</h3>
          <div v-for="req in requests" :key="req.id" class="request-block">
            <p><strong>{{ t('chat.requester') }}:</strong> {{ req.senderProfile?.displayName || t('chat.unknown') }}</p>
            <p><strong>{{ t('chat.message') }}:</strong> {{ req.message || t('chat.none') }}</p>
            <div class="button-row">
              <YamatoButton @click="accept(req)">{{ t('chat.accept') }}</YamatoButton>
              <YamatoButton type="danger" @click="reject(req)">{{ t('chat.reject') }}</YamatoButton>
            </div>
          </div>
        </div>
      </Modal>
    </transition>

    <transition name="modal">
      <Modal
        v-if="showOptionsFor"
        :visible="true"
        customClass="compact"
        @close="closeOptions"
        @after-leave="scrollToTop"
      >
        <div>
          <p class="confirm-text">{{ t('chat.confirmHideMessage') }}</p>
          <div class="modal-actions">
            <YamatoButton type="danger" @click="deleteRoom">{{ t('chat.hide') }}</YamatoButton>
          </div>
        </div>
      </Modal>
    </transition>

    <Modal
      :visible="showProfileModal"
      customClass="compact"
      @close="() => showProfileModal = false"
      @refresh="handleProfileRefresh"
      @after-leave="scrollToTop"
    >
      <ProfileSetupView
        @close="() => showProfileModal = false"
        @refresh="handleProfileRefresh"
      />
    </Modal>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listChatRooms, getPublicProfile, listChatRequests } from '@/graphql/queries'
import { updateChatRoom, updateChatRequest, createChatRoom, deleteChatRoom } from '@/graphql/mutations'
import { onUpdateChatRoom } from '@/graphql/subscriptions'
import { useRoute, useRouter } from 'vue-router'
import { getIsBack } from '@/router'

import YamatoUserSearchModal from '@/components/YamatoUserSearchModal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import Modal from '@/components/Modal.vue'
import ChatRequestModal from '@/components/ChatRequestModal.vue'
import ProfileSetupView from '@/views/ProfileSetupView.vue'
import IconButton from '@/components/IconButton.vue'
import { useNotificationStore } from '@/stores/notificationStore'


import '@/assets/variables.css'
import { useI18n } from 'vue-i18n'

const notificationStore = useNotificationStore()

const { t } = useI18n()

// 🔷 UI 状態
const iconColor = ref('#274c77')
const isReady = ref(false)
const shouldAnimate = ref(false)
const isBack = ref(null)

const route = useRoute()
const router = useRouter()

const openSentWindMessages = () => {
  router.push('/sent-wind-messages') // ✅ これが正しいルート
}

onMounted(() => {
  // ✅ from=home のときのみアニメーションフラグON
  if (route.query.from === 'home') {
    shouldAnimate.value = true
    router.replace({ path: route.path }) // クエリを除去
  }

  isBack.value = getIsBack()
})

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  mySub.value = user.attributes.sub
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'

  await Promise.all([
    fetchChatRooms(),
    fetchMyProfile(),
    checkIncomingRequests()
  ])

  setTimeout(() => {
    isReady.value = true
  }, 300)
})


// 状態
const chatRooms = ref([])
const partnerProfiles = ref({})
const mySub = ref('')
const showModal = ref(false)
const showOptionsFor = ref(null)
const showRequestModal = ref(false)
const myInitial = ref('👤')
const showProfileModal = ref(false)
const hasProfile = ref(false)
const hasIncomingRequest = ref(false)
const emit = defineEmits(['refresh'])
const requests = ref([])

function goTo(path) {
  const current = router.currentRoute.value.name
  const target = path.replace('/', '')

  if (target === 'chat-rooms' || target === 'settings') {
    router.push({ path: `/${target}`, query: { from: current } })
  } else {
    router.push(`/${target}`)
  }
}


async function fetchRequests() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const mySub = user.attributes.sub

    const res = await API.graphql({
      query: listChatRequests,
      variables: {
        filter: {
          toUserId: { eq: mySub },
          status: { eq: 'pending' }
        }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    const items = res.data.listChatRequests.items

    const enriched = await Promise.all(
      items.map(async item => {
        try {
          const profileRes = await API.graphql({
            query: getPublicProfile,
            variables: { id: item.fromUserId },
            authMode: 'AMAZON_COGNITO_USER_POOLS'
          })
          item.senderProfile = profileRes.data.getPublicProfile
        } catch {
          item.senderProfile = { displayName: '(取得失敗)' }
        }
        return item
      })
    )

    requests.value = enriched
  } catch (e) {
    console.error('❌ リクエスト取得エラー:', e)
  }
}
async function accept(req) {
  const input = {
    user1: req.fromUserId,
    user2: mySub.value,
    lastTimestamp: new Date().toISOString(),
  }

  try {
    // 🔹 チャットルーム作成
    await API.graphql(graphqlOperation(createChatRoom, { input }))

    // 🔹 リクエストの status を accepted に更新
    const updateInput = {
      id: req.id,
      status: 'accepted'
    }
    await API.graphql(graphqlOperation(updateChatRequest, { input: updateInput }))

    // 🔹 データ再取得
    await fetchChatRooms()
    await fetchRequests()

    // 🔹 モーダルを閉じる
    showRequestModal.value = false

  } catch (e) {
    console.error('❌ チャットルーム作成失敗:', e)
  }
}

function openWindInbox() {
  router.push({ name: 'wind-inbox' })  // `routes.ts` にルートを定義しておく
}

async function reject(req) {
  try {
    await API.graphql(graphqlOperation(updateChatRequest, {
      input: {
        id: req.id,
        status: "rejected"
      }
    }))
    await fetchRequests()
  } catch (e) {
    console.error('❌ 拒否エラー:', e)
  }
}

async function checkIncomingRequests() {
  const user = await Auth.currentAuthenticatedUser()
  const mySub = user.attributes.sub

  const res = await API.graphql(graphqlOperation(listChatRequests, {
    filter: {
      toUserId: { eq: mySub },
      status: { eq: "pending" }
    }
  }))
  hasIncomingRequest.value = (res.data.listChatRequests.items || []).length > 0
}
function openWindMessage(room) {
  const mySubValue = mySub.value
  const toSub = room.user1 === mySubValue ? room.user2 : room.user1
  const partner = partnerProfiles.value[toSub]

  router.push({
    name: 'wind-message',
    query: {
      toUserId: toSub,
      toDisplayName: partner?.displayName || ''  // ✅ ここを追加
    }
  })
}


let updateSubscription = null

function goToProfile() {
  router.push('/profile-setup')
}
function openOptions(room) {
  showOptionsFor.value = room
}

function closeOptions() {
  showOptionsFor.value = null
}

function handleRequestClick() {
  fetchRequests()                      // ✅ 追加
  showRequestModal.value = true
  hasIncomingRequest.value = false
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}


function handleProfileRefresh() {
  fetchMyProfile()
}
async function fetchMyProfile() {
  try {
    const res = await API.graphql(graphqlOperation(getPublicProfile, { id: mySub.value }))
    const profile = res.data.getPublicProfile
    if (profile) {
      hasProfile.value = true
      myInitial.value = profile.displayName?.[0]?.toUpperCase() || '👤'
    } else {
      hasProfile.value = false
    }
  } catch (err) {
    console.error('❌ プロフィール取得エラー:', err)
  }
}


async function deleteRoom() {
  if (!showOptionsFor.value) return
  try {
    const isUser1 = showOptionsFor.value.user1 === mySub.value
    const input = {
      id: showOptionsFor.value.id,
      ...(isUser1 ? { deletedByUser1: true } : { deletedByUser2: true })
    }
    await API.graphql(graphqlOperation(updateChatRoom, { input }))
    closeOptions()
    await fetchChatRooms() // ✅ 即再取得してリストを更新
  } catch (e) {
    console.error('❌ 削除に失敗:', e)
  }
}

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    mySub.value = user.attributes.sub

    // 🔵 プロフィール情報取得
    const res = await API.graphql(graphqlOperation(getPublicProfile, { id: mySub.value }))
    const profile = res.data.getPublicProfile

    if (profile) {
      hasProfile.value = true
      myInitial.value = profile.displayName?.[0]?.toUpperCase() || '👤'
    } else {
      hasProfile.value = false
    }

    // 📥 チャットルーム一覧取得
    await fetchChatRooms()
    await checkIncomingRequests()

    // 🔔 サブスクリプション登録
    updateSubscription = API.graphql(graphqlOperation(onUpdateChatRoom)).subscribe({
      next: ({ value }) => {
        const updated = value.data.onUpdateChatRoom

        const isUser1 = updated.user1 === mySub.value
        const isUser2 = updated.user2 === mySub.value

        // ✅ 自分が関係ないチャットルームは無視
        if (!isUser1 && !isUser2) return

        // ✅ 非表示チャットルームは無視
        if ((isUser1 && updated.deletedByUser1) || (isUser2 && updated.deletedByUser2)) return

        // ✅ 現在のルート確認
        const currentRoute = router.currentRoute.value
        const isInChat = currentRoute.name === 'chat'
        const currentChatRoomId = currentRoute.params.roomId

        // ✅ チャット画面にいて、かつ同じルームなら通知は出さない
        if (!(isInChat && currentChatRoomId === updated.id) && updated.lastSenderId !== mySub.value) {
          notificationStore.setUnread(true)
        }

        // 🔄 ローカルデータ更新
        const index = chatRooms.value.findIndex(r => r.id === updated.id)

        if (index !== -1) {
          chatRooms.value[index] = { ...chatRooms.value[index], ...updated }
        } else {
          // ✅ user1/user2の組み合わせが既に存在しないかチェック
          const exists = chatRooms.value.some(r =>
            (r.user1 === updated.user1 && r.user2 === updated.user2) ||
            (r.user1 === updated.user2 && r.user2 === updated.user1)
          )
          if (!exists) {
            chatRooms.value.unshift(updated)
          }
        }

        chatRooms.value.sort(
          (a, b) => new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0)
        )
      },
      error: err => console.warn('⚠️ onUpdateChatRoom 失敗:', err)
    })

  } catch (err) {
    console.error('❌ 初期化失敗:', err)
  }
})


async function fetchChatRooms() {
  try {
    const res = await API.graphql(graphqlOperation(listChatRooms, {
      filter: {
        or: [
          { user1: { eq: mySub.value } },
          { user2: { eq: mySub.value } }
        ]
      },
      limit: 50
    }))

    const allRooms = res.data.listChatRooms.items || []

    const now = new Date()
    const retainedRooms = []

    for (const room of allRooms) {
      if (!room || !room.user1 || !room.user2) continue

      const isUser1 = room.user1 === mySub.value
      const isUser2 = room.user2 === mySub.value

      // 🧼 自分が非表示にしたチャットルームはスキップ
      if ((isUser1 && room.deletedByUser1) || (isUser2 && room.deletedByUser2)) continue

      // ⏳ 最終活動日から365日以上経過 → 物理削除
      const base = room.lastTimestamp || room.createdAt
      if (!base) continue
      const baseDate = new Date(base)
      const diffDays = (now - baseDate) / (1000 * 60 * 60 * 24)

      if (diffDays > 365) {
        try {
          await API.graphql(graphqlOperation(deleteChatRoom, {
            input: { id: room.id }
          }))
          console.log(`🗑️ 自動削除: ${room.id}`)
        } catch (err) {
          console.error('❌ 削除失敗:', err)
        }
        continue
      }

      retainedRooms.push(room)
    }

    chatRooms.value = retainedRooms

    // 👤 プロフィール取得
    for (const room of retainedRooms) {
      const idsToFetch = new Set([room.user1, room.user2, room.lastSenderId])
      for (const id of idsToFetch) {
        if (id && !partnerProfiles.value[id]) {
          try {
            const profileRes = await API.graphql(graphqlOperation(getPublicProfile, { id }))
            const profile = profileRes.data.getPublicProfile
            if (profile) {
              partnerProfiles.value[id] = profile
            }
          } catch (err) {
            console.warn('⚠️ PublicProfile取得失敗:', id)
          }
        }
      }
    }

  } catch (e) {
    console.error('❌ ChatRoom一覧取得エラー:', e)
  }
}

function getPartnerDisplayName(room) {
  const partnerSub = room.user1 === mySub.value ? room.user2 : room.user1
  const profile = partnerProfiles.value[partnerSub]
  return profile?.displayName || '（未設定）'
}

function getPartnerYamatoId(room) {
  const partnerSub = room.user1 === mySub.value ? room.user2 : room.user1
  const profile = partnerProfiles.value[partnerSub]
  return profile?.yamatoId || partnerSub
}

function getSenderDisplayName(room) {
  const senderId = room.lastSenderId
  const profile = partnerProfiles.value[senderId]
  return profile?.displayName || '（未設定）'
}

const sortedRooms = computed(() => {
  return [...chatRooms.value].sort((a, b) => {
    return new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0)
  })
})

function goToRoom(targetRoomId, receiverYamatoId) {
  showOptionsFor.value = null
  const now = new Date().toISOString()
  const room = chatRooms.value.find(r => r.id === targetRoomId)
  if (room) {
    const input = {
      id: room.id,
      ...(room.user1 === mySub.value ? { lastReadAtUser1: now } : { lastReadAtUser2: now })
    }
    API.graphql(graphqlOperation(updateChatRoom, { input }))
      .catch(err => console.warn('⚠️ 既読更新失敗:', err))
  }


  router.push({ name: 'chat', params: { roomId: targetRoomId, receiverYamatoId } })
}

function hasUnread(room) {
  if (room.lastSenderId === mySub.value) return false
  if (!room.lastTimestamp) return false
  const last = new Date(room.lastTimestamp)
  const readRaw = room.user1 === mySub.value ? room.lastReadAtUser1 : room.lastReadAtUser2
  if (!readRaw) return true
  const read = new Date(readRaw)
  return last > read
}

function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  return date.toLocaleString('ja-JP', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

function getExpiryIcon(room) {
  const base = room.lastTimestamp || room.createdAt
  if (!base) return '🌱'

  const now = new Date()
  const baseDate = new Date(base)
  if (isNaN(baseDate)) return '🌱'

  const diffDays = (now - baseDate) / (1000 * 60 * 60 * 24)

  if (diffDays < 30) return '🌱'        // 発芽：〜29日
  else if (diffDays < 300) return '🌷'  // 開花：30〜299日
  else return '🥀'                      // 枯れ：300日〜
}

function goToRequestView() {
  router.push({ name: 'chat-requests' })
}
async function handleRefreshAndClose() {
  console.log('📥 モーダルからrefresh受信')
  await fetchChatRooms()
  console.log('✅ チャットルーム再取得完了')
  showRequestModal.value = false
}

function openSearchModal() {
  if (!hasProfile.value) {
    showProfileModal.value = true  // ✅ プロフィール未登録 → 登録モーダルへ
  } else {
    showModal.value = true         // ✅ 登録済 → Yamato検索モーダルへ
  }
}

function openProfileModal() {
  showProfileModal.value = true    // 🔘 パーソナルアイコン押下で直接表示
}

function goToWindMessage() {
  router.push({ name: 'wind-message' })  // 適宜ルート名に合わせて修正
}

async function checkUnreadStatus() {
  let hasAnyUnread = false

  for (const room of chatRooms.value) {
    if (!room.lastTimestamp || room.lastSenderId === mySub.value) continue

    const last = new Date(room.lastTimestamp)
    const readRaw = room.user1 === mySub.value ? room.lastReadAtUser1 : room.lastReadAtUser2
    if (!readRaw || last > new Date(readRaw)) {
      hasAnyUnread = true
      break
    }
  }

  if (hasAnyUnread) {
    notificationStore.setUnread(true)
  } else {
    notificationStore.clearUnread()
  }
}

onBeforeUnmount(() => {
  checkUnreadStatus()
})

defineExpose({ accept, reject })

</script>



<style>
.chat-room-list {
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}

/* ヘッダー */
.chat-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-title {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  color: black !important;
}
@media (prefers-color-scheme: dark) {
  .header-title {
    color: white !important;
  }
}

.header-icons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

/* チャットルーム一覧 */
.room-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* チャットカード */
.room-card {
  width: 330px;
  height: 90px;
  overflow: hidden;
  padding: 0.8rem 0.8rem 0.8rem 2.4rem;
  background: white;
  border-bottom: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: var(--yamato-shadow, 0 2px 4px rgba(0, 0, 0, 0.05));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #000;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .room-card {
    width: 400px;
  }
}
@media (min-width: 1024px) {
  .room-card {
    width: 480px;
  }
}
@media (prefers-color-scheme: dark) {
  .room-card {
    background: #444;
    color: #fff;
    border-bottom: 1px solid #666;
  }
}

/* 相手名の行 */
.partner-name {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 🌱と名前 */
.left-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-grow: 1;
}
.name-text {
  font-weight: bold;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* …と✉️ */
.menu-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto; /* ✅ 右寄せ強制 */
}
.menu-dots,
.mail-icon {
  font-size: 1.1rem;
  color: #888;
  cursor: pointer;
}
.menu-dots:hover,
.mail-icon:hover {
  color: #333;
}

/* メッセージ */
.last-message {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: #bbb;
  overflow: hidden;
}
.message-text {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unread-dot.inline {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
  background-color: var(--yamato-primary);
}

/* 時刻 */
.last-time {
  font-size: 0.8rem;
  color: #888;
}

/* モーダルなど */
.modal-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #222;
}
@media (prefers-color-scheme: dark) {
  .modal-title {
    color: white;
  }
}
.compact {
  background: #fff;
  color: #111;
  padding: 1.2rem;
  max-width: 400px;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
@media (prefers-color-scheme: dark) {
  .compact {
    background: #2a2a2a;
    color: #fff;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
  }
}

/* アニメーション */
.modal-enter-active {
  animation: dropDown 0.4s ease-out;
}
.modal-leave-active {
  animation: flyUp 0.3s ease-in;
}
@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
.fadeSlideIn-enter-active {
  animation: fadeInUp 0.4s ease;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropDown-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.dropDown-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.dropDown-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* モーダル確認 */
.modal-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}
.confirm-text {
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 1.2rem;
  width: 100%;
  color: #222;
}
@media (prefers-color-scheme: dark) {
  .confirm-text {
    color: #fff;
  }
}


</style>



