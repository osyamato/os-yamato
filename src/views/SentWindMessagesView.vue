<template>
  <div class="wind-view">
    <h2 class="view-title">{{ t('wind.sentTitle') }}</h2>

    <!-- 📜 送信済み手紙リスト -->
    <ul class="wind-list">
      <li
        v-for="msg in filteredOpenedMessages"
        :key="msg.id"
        class="wind-list-item"
        @click="openModal(msg)"
      >
        <span class="recipient-label">
          <span v-if="isWilting(msg)">🥀</span>
          To:
        </span>
        <span class="name">{{ msg.toUserId }}</span>
      </li>
    </ul>

    <!-- 📬 手紙詳細モーダル -->
    <Transition name="fly">
      <div
        v-if="selectedMessage"
        class="letter-overlay"
        @click.self="selectedMessage = null"
      >
        <div class="letter-card">
          <button class="delete-button" @click="promptDeleteMessage(selectedMessage.id)">⋯</button>
          <button class="favorite-button" @click="toggleFavorite(selectedMessage)">
            <span :class="{ favorited: selectedMessage?.favoriteByReceiver }">♡</span>
          </button>
          <h3 class="letter-title">{{ t('wind.title') }}</h3>
          <div class="letter-content">
            <p class="letter-body">{{ selectedMessage.content }}</p>
            <div class="signature">
              {{ t('wind.fromDisplayName', { name: selectedMessage.fromDisplayName }) }}<br />
              {{ formatDate(selectedMessage.deliveryDate) }}
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ✅ 確認モーダル -->
    <ConfirmDialog
      :visible="showConfirm"
      :message="confirmMessage"
      @confirm="handleConfirmedDelete"
      @cancel="cancelDeleteMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { listWindMessages } from '@/graphql/queries'
import { deleteWindMessage } from '@/graphql/mutations'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const messages = ref([])
const selectedMessage = ref(null)
const showConfirm = ref(false)
const confirmMessage = ref('')
const messageToDeleteId = ref(null)

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  const sub = user.attributes.sub

  const res = await API.graphql(
    graphqlOperation(listWindMessages, {
      filter: {
        fromUserId: { eq: sub },
        createdAt: { ge: new Date(Date.now() - 7 * 86400000).toISOString() }
      },
      limit: 1000
    })
  )
  messages.value = res.data.listWindMessages.items
})

const filteredOpenedMessages = computed(() =>
  messages.value.filter((msg) => !msg.deletedByReceiver)
)

const openModal = (msg) => {
  selectedMessage.value = msg
}

const promptDeleteMessage = (id) => {
  confirmMessage.value = t('wind.confirmDelete')
  messageToDeleteId.value = id
  showConfirm.value = true
}

const cancelDeleteMessage = () => {
  showConfirm.value = false
  messageToDeleteId.value = null
}

const handleConfirmedDelete = async () => {
  if (!messageToDeleteId.value) return
  try {
    await API.graphql(
      graphqlOperation(deleteWindMessage, { input: { id: messageToDeleteId.value } })
    )
    messages.value = messages.value.filter((m) => m.id !== messageToDeleteId.value)
  } catch (e) {
    console.error('削除失敗', e)
  } finally {
    showConfirm.value = false
    selectedMessage.value = null
  }
}

const toggleFavorite = (msg) => {
  msg.favoriteByReceiver = !msg.favoriteByReceiver
}

const isWilting = (msg) => {
  const createdAt = new Date(msg.createdAt)
  const daysPassed = (Date.now() - createdAt.getTime()) / 86400000
  return daysPassed >= 6.5
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
</script>

<style scoped>
.wind-view {
  text-align: center;
  padding: 1.5rem;
}
.view-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.wind-list-item {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0 auto 1rem;
  max-width: 230px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}
.wind-list-item:hover {
  transform: scale(1.03);
}
.letter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.letter-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  position: relative;
  width: 90%;
  max-width: 480px;
}
.letter-title {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
.letter-content {
  text-align: left;
}
.signature {
  margin-top: 2rem;
  text-align: right;
  font-size: 0.9rem;
  color: gray;
}
.delete-button,
.favorite-button {
  position: absolute;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
}
.delete-button {
  top: 1rem;
  right: 1rem;
}
.favorite-button {
  top: 1rem;
  left: 1rem;
}
.favorited {
  color: hotpink;
}
</style>

