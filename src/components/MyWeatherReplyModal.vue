<template>
  <Modal :visible="visible" @close="close">
    <div class="weather-reply-modal">
      <!-- 🌤️ タイトル -->

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
            <!-- 🖼️ アイコン -->
            <div class="reply-icon">
              <img v-if="reply.icon" :src="`/${reply.icon}`" />
              <div v-else class="icon-initial">{{ reply.ownerNickname?.[0] || '？' }}</div>
            </div>

            <!-- 💬 内容 -->
            <div class="reply-body" @click="toggleVisibility(reply)">
              <div class="nickname">{{ reply.ownerNickname }}</div>
              <div class="reply-text">{{ reply.content }}</div>
            </div>

            <!-- 🔘 メニュー（非表示切り替え） -->
            <div class="reply-menu">
              <button class="delete-button" @click="toggleHidden(reply)">
                {{ reply.hiddenByCommentOwner ? '👁️‍🗨️' : '🙈' }}
              </button>
            </div>
          </div>
        </div>

<transition name="fade">
  <div v-show="showNoReplyMessage" class="no-reply">
    {{ t('weather.noRepliesPoetic1') }}<br />
    {{ t('weather.noRepliesPoetic2') }}
  </div>
</transition>
      </div>
    </div>
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

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  commentId: String,
  parentComment: Object,
})

const emit = defineEmits(['close'])

const replies = ref([])

const visibleReplies = computed(() =>
  replies.value.filter(r => !r.hiddenByCommentOwner)
)

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
    console.log('👀 props changed:', { visible, commentId })
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

    console.log('📡 Fetching replies for commentId:', props.commentId)

    const res = await API.graphql(graphqlOperation(listWeatherReplies, {
      filter: { commentId: { eq: props.commentId } }
    }))
    
    const items = res.data.listWeatherReplies.items
    replies.value = items
    console.log('✅ Replies fetched:', items)
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
    console.log('🔁 Updated visibility for reply:', reply.id)
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
  padding: 1rem;
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
  justify-content: space-between;
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
  flex-grow: 1;
  max-width: calc(100% - 4rem); /* アイコンと削除ボタン分 */
  cursor: pointer;
}

.nickname {
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.2rem;
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

</style>

