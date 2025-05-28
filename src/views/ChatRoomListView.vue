<template>
  <div class="chat-room-list">
    <!-- ✅ アニメーションを適用する内部ラッパー -->
    <div class="chat-room-wrapper">
      <!-- 🔷 ヘッダー -->
<div class="chat-header">
  <h2 class="header-title">メッセージ</h2>

<transition name="fade-in">
  <div class="header-icons" v-if="isReady">
    <IconButton :color="iconColor" @click="openProfileModal">
      {{ myInitial }}
    </IconButton>
    <IconButton
      v-if="hasProfile"
      :color="iconColor"
      :class="{ blink: hasIncomingRequest }"
      @click="handleRequestClick"
    >📮</IconButton>
    <IconButton
      v-if="hasProfile"
      :color="iconColor"
      @click="openSearchModal"
    >＋</IconButton>
    <IconButton
      v-if="hasProfile"
      :color="iconColor"
      @click="openWindInbox"
    >🕊️</IconButton>
  </div>
</transition>
 </div>
      <!-- 🔷 チャットルーム一覧 -->
<!-- 🔷 チャットルーム一覧 -->
<transition name="fadeSlideIn">
  <div class="room-list" v-if="isReady">
    <div
      v-for="room in sortedRooms"
      :key="room.id"
      class="room-card"
      @click="goToRoom(room.id, getPartnerYamatoId(room))"
    >
<p class="partner-name">
  <span class="icon">{{ getExpiryIcon(room) }}</span>
<span class="name-text">
  {{
    getPartnerDisplayName(room).length > 15
      ? getPartnerDisplayName(room).slice(0, 15) + '…'
      : getPartnerDisplayName(room)
  }}
</span>
  <span class="menu-dots" @click.stop="openOptions(room)">⋯</span>
  <span class="mail-icon" @click.stop="openWindMessage(room)">✉️</span>
</p>

      <p class="last-message">
        <span v-if="hasUnread(room)" class="unread-dot inline"></span>
        <span class="message-text">
          {{
            room.lastMessage
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
    </div>

    <!-- 🔷 Yamato ID 検索モーダル -->
    <YamatoUserSearchModal v-if="showModal" :onClose="() => showModal = false" />

    <!-- 🔷 チャット申請モーダル -->
    <transition name="modal">
      <Modal
        v-if="showRequestModal"
        :visible="true"
        :customClass="'modal-inner-card'"
        @close="() => showRequestModal = false"
      >
        <div>
          <h3 class="modal-title">🌱あたらしい会話の芽が届きました🌱</h3>
          <div v-for="req in requests" :key="req.id" class="request-block">
            <p><strong>申請者:</strong> {{ req.senderProfile?.displayName || '不明' }}</p>
            <p><strong>メッセージ:</strong> {{ req.message || '（なし）' }}</p>
            <div class="button-row">
              <YamatoButton @click="accept(req)">承認</YamatoButton>
              <YamatoButton type="danger" @click="reject(req)">拒否</YamatoButton>
            </div>
          </div>
        </div>
      </Modal>
    </transition>

    <!-- 🔷 削除確認モーダル -->
    <transition name="modal">
      <Modal
        v-if="showOptionsFor"
        :visible="true"
        :customClass="'modal-inner-card'"
        @close="closeOptions"
        @after-leave="scrollToTop"
      >
        <div>
          <p class="confirm-text">このメッセージを雲にかくしますか？</p>
          <div class="modal-actions">
            <YamatoButton type="danger" @click="deleteRoom">かくす</YamatoButton>
          </div>
        </div>
      </Modal>
    </transition>

    <!-- 🔷 プロフィールモーダル -->
    <Modal
      :visible="showProfileModal"
      :customClass="'modal-inner-card'"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listChatRooms, getPublicProfile } from '@/graphql/queries'
import { updateChatRoom } from '@/graphql/mutations'
import { onUpdateChatRoom } from '@/graphql/subscriptions'
import { useRouter } from 'vue-router'
import { listChatRequests } from '@/graphql/queries'

import YamatoUserSearchModal from '@/components/YamatoUserSearchModal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import Modal from '@/components/Modal.vue'
import ChatRequestModal from '@/components/ChatRequestModal.vue'
import ProfileSetupView from '@/views/ProfileSetupView.vue'
import { updateChatRequest, createChatRoom } from '@/graphql/mutations'
import '@/assets/variables.css'
import { deleteChatRoom } from '@/graphql/mutations'

import IconButton from '@/components/IconButton.vue'

const iconColor = ref('#274c77')
const isReady = ref(false)

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
const router = useRouter()
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

        // 🧼 自分が非表示にしているなら無視
        const isUser1 = updated.user1 === mySub.value
        const isUser2 = updated.user2 === mySub.value
        if ((isUser1 && updated.deletedByUser1) || (isUser2 && updated.deletedByUser2)) {
          return  // ✅ 自分が非表示にしたチャットは表示しない
        }

        const index = chatRooms.value.findIndex(r => r.id === updated.id)

        if (index !== -1) {
          chatRooms.value[index] = { ...chatRooms.value[index], ...updated }
        } else {
          chatRooms.value.unshift(updated)
        }

        chatRooms.value.sort((a, b) => new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0))
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


defineExpose({ accept, reject })

</script>


<style>

.chat-room-list {
  padding: 2rem;
 font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}


.title {
  flex-grow: 1;
  text-align: center;
  font-size: 1.2rem;
}

button {
  font-size: 1.5rem;
  background: none;
  border: none;
  color: var(--yamato-primary);
  cursor: pointer;
}

.empty-message {
  margin-top: 2rem;
  color: #888;
  text-align: center;
}

.room-list {
  margin-top: 1.5rem;
}

.room-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center; /* ✅ 中央寄せ */
}

/* 📦 カード自体のレイアウトを固定 */
.room-card {
  width: 100%;
  max-width: 330px;       /* ✅ 最大幅を固定 */
  min-width: 300px;
  margin-bottom: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--yamato-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--yamato-shadow);
}


@media (prefers-color-scheme: dark) {
  .room-card {
    background: #444; /* ダークモード時はグレーに */
  }
}

/* 🧍 名前とアイコンの行 */
.partner-name {
  display: flex;
  align-items: center;
  justify-content: space-between; /* ✅ 左右に分ける */
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
}

/* 🧾 名前部分だけを省略対応に */
.name-text {
  max-width: 180px; /* 💡 好みに応じて調整可 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}

/* 📧 メニューとメールアイコン */
.menu-dots,
.mail-icon {
  flex-shrink: 0;
  margin-left: 0.5rem;
  font-size: 1.1rem;
  color: #888;
  cursor: pointer;
}
.mail-icon:hover,
.menu-dots:hover {
  color: #333;
}

.icon-stack {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  width: 1.5em;
}

.last-message {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: #bbb;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
}

.message-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 0;
  max-width: 100%;
}

.unread-dot.inline {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
  background-color: var(--yamato-primary);
}

.last-time {
  font-size: 0.8rem;
  color: #888;
}

.menu-dots {
  margin-left: auto;
  cursor: pointer;
  font-size: 1.2rem;
  color: #888;
}

.menu-dots:hover {
  color: #333;
}

.modal-content {
  padding: 1.5rem;
  background: #fff;
  border-radius: var(--yamato-radius);
  text-align: center;
}

.modal-content button {
  margin: 0.5rem auto;
  display: block;
  width: 100%;
  max-width: 200px;
}

.confirm-text {
  font-size: 0.95rem;
  color: #999;
  text-align: center;
  margin-bottom: 1.2rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
  color: black; /* デフォルト（ライトモード） */
}

@media (prefers-color-scheme: dark) {
  .modal-title {
    color: white; /* ダークモード時は白に */
  }
}

@media (prefers-color-scheme: dark) {
  .header-button {
    background-color: #333;
    color: var(--yamato-text-light);
  }
}

.circle-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--yamato-primary);
  color: var(--yamato-text-light);
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.5rem;
}

.blink {
  animation: blink-animation 2.4s infinite;
}

@keyframes blink-animation {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  gap: 0.6rem;
}

.chat-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}


.header-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem; /* ← ここで上にスペース追加 */
}


.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem 1rem;
  text-align: center;
}


.request-block {
  margin: 1.5rem auto;
  padding: 1rem;
  background: none;
  border: none;
  color: inherit;
  max-width: 500px;
  font-size: 1.1rem;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.request-card {
  background: #ffffff;
  color: #111111;
  border-radius: var(--yamato-radius);
  padding: 1.5rem;
  max-width: 520px;
  margin: auto;
  box-shadow: var(--yamato-shadow);
  border: 1px solid var(--yamato-border);
}

@media (prefers-color-scheme: dark) {
  .header-button {
    background-color: var(--yamato-primary);
    color: var(--yamato-text-light);
  }
}

.request-block {
  margin-bottom: 1.5rem;
  text-align: left;
}

.modal-enter-active {
  animation: dropDown 0.4s ease-out;
}

.modal-leave-active {
  animation: flyUp 0.3s ease-in;
}

@keyframes dropDown {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes flyUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
}
.chat-room-wrapper {
  animation: fadeSlideIn 0.5s ease-out;
}

@keyframes fadeSlideIn {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.chat-room-wrapper {
  animation: fadeSlideIn 0.5s ease-out;
}

@keyframes fadeSlideIn {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
/* ふわっと表示用 */
.fade-in-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-in-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-in-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.mail-icon {
  margin-left: 0.6rem; /* ⋯との間に少しスペース */
  font-size: 1.0rem;
  cursor: pointer;
  color: var(--yamato-primary);
}

.mail-icon:hover {
  color: var(--yamato-primary-dark);
}

.header-title {
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: black; /* デフォルトは黒（ライトモード用） */
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .header-title {
    color: white; /* ダークモード時のみ白に上書き */
  }
}

</style>


