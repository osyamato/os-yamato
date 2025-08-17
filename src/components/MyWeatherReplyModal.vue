<template>
  <Modal :visible="visible" @close="close">
    <transition name="reply-modal-transition">
      <div class="weather-reply-modal" v-if="visible">
        <!-- 📝 親コメント -->
        <div class="parent-comment">
          {{ parentComment?.content }}
        </div>

        <!-- 💬 リプライ一覧 -->
        <div class="modal-scroll-area">
          <div v-if="visibleReplies.length" class="reply-list">
            <div
              v-for="reply in visibleReplies"
              :key="reply.id"
              class="reply-item-row"
            >
              <!-- アイコン -->
              <div class="reply-icon" @click.stop="openProfile(reply)">
                <img v-if="reply.icon" :src="`/${reply.icon}`" />
                <div v-else class="icon-initial">
                  {{ reply.ownerNickname?.[0] || '？' }}
                </div>
              </div>

              <!-- 本文 -->
              <div class="reply-body">
                <span class="nickname" @click.stop="openProfile(reply)">
                  {{ reply.ownerNickname }}
                </span>
                <div class="reply-text">{{ reply.content }}</div>
              </div>

              <!-- 非表示ボタン -->
              <div class="reply-menu">
                <button class="delete-button" @click="toggleHidden(reply)">
                  {{ reply.hiddenByCommentOwner ? '👁️‍🗨️' : '🙈' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 詩的メッセージ -->
          <transition name="fade">
            <div v-show="showNoReplyMessage" class="no-reply">
              {{ t('weather.noRepliesPoetic1') }}<br />
              {{ t('weather.noRepliesPoetic2') }}
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </Modal>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { listWeatherReplies } from '@/graphql/queries'
import { updateWeatherReply } from '@/graphql/mutations'
import { useI18n } from 'vue-i18n'
import { onMounted, onBeforeUnmount } from 'vue'

import Modal from '@/components/Modal.vue'
import WeatherProfileModal from '@/components/WeatherProfileModal.vue'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  commentId: String,
  parentComment: Object,
})


const replies = ref([])

const visibleReplies = computed(() =>
  replies.value.filter(r => !r.hiddenByCommentOwner)
)
const emit = defineEmits(['close', 'open-profile'])

function openProfile(reply) {
  if (!reply.owner) return
  emit('open-profile', reply.owner)
}

const showNoReplyMessage = ref(false)
let noReplyTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => replies.value,
  (newVal) => {
    if (newVal.length === 0) {
      showNoReplyMessage.value = false
      if (noReplyTimeout) clearTimeout(noReplyTimeout)
      noReplyTimeout = setTimeout(() => {
        showNoReplyMessage.value = true
      }, 500)
    } else {
      showNoReplyMessage.value = false
      if (noReplyTimeout) clearTimeout(noReplyTimeout)
    }
  }
)

onBeforeUnmount(() => {
  if (noReplyTimeout) clearTimeout(noReplyTimeout)
})

watch(
  () => [props.visible, props.commentId],
  async ([visible, commentId]) => {
    if (visible && commentId) {
      await fetchReplies()
    }
  },
  { immediate: true }
)

async function fetchReplies() {
  try {
    if (!props.commentId) {
      console.warn('⚠️ No commentId provided for fetchReplies()')
      return
    }


    const res = await API.graphql(graphqlOperation(listWeatherReplies, {
      filter: { commentId: { eq: props.commentId } }
    }))
    
    const items = res.data.listWeatherReplies.items
    replies.value = items
  } catch (e) {
    console.error('❌ Failed to fetch replies', e)
  }
}

async function toggleHidden(reply) {
  const confirmMessage = t('weather.hideConfirm') // ローカライズ対応
  const confirmed = window.confirm(confirmMessage)
  if (!confirmed) return

  try {
    const updated = {
      id: reply.id,
      hiddenByCommentOwner: !reply.hiddenByCommentOwner
    }
    await API.graphql(graphqlOperation(updateWeatherReply, { input: updated }))
    reply.hiddenByCommentOwner = !reply.hiddenByCommentOwner
  } catch (e) {
    console.error('❌ Failed to update visibility', e)
  }
}

function toggleVisibility(reply) {
  // Reserved for future: open profile or reply modal
}

function close() {
  emit('close')
}
</script>

<style scoped>
.weather-reply-modal {
  min-height: 200px;
  max-height: 70vh; /* 📱スマホで画面の70%までに制限 */
  overflow-y: auto;
  transition: min-height 0.3s ease;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: 1rem;
}

@media (max-width: 600px) {
  .weather-reply-modal {
    max-height: 60vh; /* スマホではより控えめに */
  }
}

.parent-comment {
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1.2rem;
}

.modal-scroll-area {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 4px;
}

.reply-list {
  margin-bottom: 1rem;
}

.reply-item-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem; /* ✅ アイコンと本文の間に余白 */
  padding: 0.5rem 0;
  position: relative;
}

.reply-icon {
  width: 2rem;
  height: 2rem;
  margin-right: 0.6rem;
  flex-shrink: 0;
  position: relative;
}

.reply-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.icon-initial {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ccc;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}
@media (prefers-color-scheme: dark) {
  .icon-initial {
    background-color: #444;
    color: #eee;
  }
}


.reply-body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: calc(100% - 4rem); /* アイコンと削除ボタン分 */
  cursor: pointer;
}

.nickname {
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.3rem; /* ✅ 少し余白を増やす */
  text-align: left;
}
@media (prefers-color-scheme: dark) {
  .nickname {
    color: #ddd;
  }
}

.reply-text {
  font-size: 1rem;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-reply {
  font-style: italic;
  text-align: center;
  margin-bottom: 1rem;
  color: #888;
}

.reply-menu {
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.delete-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #666;
  cursor: pointer;
  padding: 0 0.3rem;
  line-height: 1;
  transition: color 0.2s;
}
.delete-button:hover {
  color: #d00;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

.reply-modal-transition-enter-active {
  animation: dropDown 0.4s ease-out;
}
.reply-modal-transition-leave-active {
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

</style>

