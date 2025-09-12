<template>
  <div class="wind-view">
    <h2 class="view-title">{{ t('wind.sentTitle') }}</h2>
<p v-if="filteredOpenedMessages.length === 0" class="empty-notice floaty">
   {{ t('wind.cancelNotice') }}
</p>

    <!-- 📜 送信済み手紙リスト -->
    <ul class="wind-list">
      <li
        v-for="msg in filteredOpenedMessages"
        :key="msg.id"
        class="wind-list-item"
        @click="openModal(msg)"
      >
<span class="recipient-label">
  {{ t('wind.to', { name: msg.toDisplayName || msg.toUserId }) }}
</span>
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
  <!-- 🗑️ 削除ボタン（右上に絶対配置） -->
  <div class="icon-wrapper">
<IconButton :color="iconColor" size="small" @click="handleDelete">
  🗑️
</IconButton>
  </div>

          <h3 class="letter-title">{{ t('wind.title') }}</h3>
          <div class="letter-content">
            <p class="letter-body">{{ selectedMessage.content }}</p>
            <div class="signature">
              {{ t('wind.fromDisplayName', { name: selectedMessage.fromDisplayName }) }}<br />
              {{ formatDeliveryHint(selectedMessage.deliveryDate) }}
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
import IconButton from '@/components/IconButton.vue'
import { useI18n } from 'vue-i18n'

// ✅ Cognito属性からカラーを取得（useUserColor の代替）
const iconColor = ref('#274c77')

const { t } = useI18n()

const messages = ref([])
const selectedMessage = ref(null)
const showConfirm = ref(false)
const confirmMessage = ref('')
const messageToDeleteId = ref(null)

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  const sub = user.attributes.sub

  // ✅ カスタムカラーを反映（メモや連絡先と同様）
  const userColor = user.attributes['custom:iconColor']
  if (userColor) iconColor.value = userColor

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
  messages.value
    .filter((msg) => !msg.deletedByReceiver)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 新しい順
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

const handleDelete = () => {
  if (selectedMessage.value?.id) {
    promptDeleteMessage(selectedMessage.value.id)
  }
}

const isWilting = (msg) => {
  const createdAt = new Date(msg.createdAt)
  const daysPassed = (Date.now() - createdAt.getTime()) / 86400000
  return daysPassed >= 6.5
}

function getSeasonKey(month) {
  if ([12, 1, 2].includes(month)) return 'wind.season.winter'
  if ([3, 4, 5].includes(month)) return 'wind.season.spring'
  if ([6, 7, 8].includes(month)) return 'wind.season.summer'
  if ([9, 10, 11].includes(month)) return 'wind.season.autumn'
}

function formatDeliveryHint(dateStr) {
  const date = new Date(dateStr)
  const seasonKey = getSeasonKey(date.getMonth() + 1)
  return t('wind.deliveryHint', { season: t(seasonKey) })
}
</script>

<style scoped>
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

.wind-view {
  text-align: center;
  padding: 1.5rem;
  animation: dropDown 0.5s ease-out;
}
.view-title {
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  margin-top: 1.5rem;
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

.view-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.icon-wrapper {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

/* スタイル追加（scoped内） */
.delete-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--icon-bg, #274c77);
  border-radius: 9999px;
  font-size: 0.8rem;
  padding: 0.4rem;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}
.delete-icon:hover {
  transform: scale(1.1);
}

.icon-button.small {
  font-size: 1.1rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

@keyframes float {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}

.floaty {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
  font-size: 0.95rem;
  color: #666;
  margin-top: 1rem;
}


</style>

