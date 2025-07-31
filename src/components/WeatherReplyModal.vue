<template>
  <Modal :visible="visible" @close="handleClose">
    <div class="weather-reply-modal">
      <!-- 🌪️ スクロール領域 -->
      <div class="modal-scroll-area">
        <!-- 💬 親コメント -->
        <div class="parent-comment" v-if="parentComment">
          <p class="parent-text">{{ parentComment.content }}</p>
        </div>

        <!-- 💬 既存リプライ一覧 -->
        <div class="reply-list" v-if="replies.length > 0">
          <div v-for="reply in replies" :key="reply.id" class="reply-item">
            <div class="reply-icon">
              <span class="icon-initial">
                {{ reply.ownerNickname?.charAt(0) || '❓' }}
              </span>
            </div>
            <div class="reply-body">
              <div class="nickname">{{ reply.ownerNickname }}</div>
              <p class="reply-text">{{ reply.content }}</p>
            </div>
          </div>
        </div>
        <div v-else class="no-reply">{{ t('weather.noReplies') }}</div>
      </div>

      <!-- ✍️ 新規リプライ入力 -->
      <div class="input-row">
        <textarea
          v-model="replyContent"
          ref="textareaRef"
          class="chat-textarea"
          :placeholder="t('weather.enterReply')"
          rows="1"
          @input="autoResize"
        />
        <button
          class="send-button"
          :disabled="!replyContent.trim() || !profileLoaded"
          @click="submitReply"
        >
          ⇧
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/Modal.vue'
import { createWeatherReply } from '@/graphql/mutations'
import { listWeatherReplies, getWeatherComment, getWeatherProfile } from '@/graphql/queries'

const props = defineProps({
  visible: Boolean,
  commentId: String,
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const replyContent = ref('')
const ownerNickname = ref('名無し')
const profileLoaded = ref(false)
const replies = ref([])
const parentComment = ref(null)
const textareaRef = ref(null)

function handleClose() {
  replyContent.value = ''
  replies.value = []
  parentComment.value = null
  emit('close')
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

async function fetchProfileInfo() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub
    const res = await API.graphql(graphqlOperation(getWeatherProfile, { id: sub }))
    const profile = res.data.getWeatherProfile
    if (profile) {
      ownerNickname.value = profile.nickname || '名無し'
    }
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err)
  } finally {
    profileLoaded.value = true
  }
}

async function fetchReplies() {
  try {
    if (!props.commentId) return
    const res = await API.graphql(
      graphqlOperation(listWeatherReplies, {
        filter: { commentId: { eq: props.commentId } }
      })
    )
    replies.value = res.data.listWeatherReplies.items.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )
  } catch (err) {
    console.error('❌ Failed to fetch replies:', err)
  }
}

async function fetchParentComment() {
  try {
    if (!props.commentId) return
    const res = await API.graphql(graphqlOperation(getWeatherComment, { id: props.commentId }))
    parentComment.value = res.data.getWeatherComment
  } catch (err) {
    console.error('❌ Failed to fetch parent comment:', err)
  }
}

async function submitReply() {
  try {
    const input = {
      commentId: props.commentId,
      content: replyContent.value.trim(),
      language: 'ja',
      ownerNickname: ownerNickname.value
    }
    await API.graphql(graphqlOperation(createWeatherReply, { input }))
    replyContent.value = ''
    await fetchReplies()
  } catch (err) {
    console.error('❌ Failed to submit reply:', err)
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      fetchProfileInfo()
      fetchReplies()
      fetchParentComment()
    }
  }
)
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
  padding-right: 4px; /* スクロールバー余白 */
}

.reply-list {
  margin-bottom: 1rem;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.2rem;
}

.reply-icon {
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
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
  align-items: flex-start;
  flex: 1;
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

/* ✅ 入力行と送信ボタン（⇧） */
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.chat-textarea {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.6rem;
  resize: none;
  font-size: 1rem;
  background: #fff;
  max-height: 150px;
  overflow-y: auto;
}

.send-button {
  background-color: #2d4a77;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: #999;
}

@media (prefers-color-scheme: dark) {
  .chat-textarea {
    background: #222;
    color: #eee;
    border-color: #555;
  }

  .send-button {
    color: #eee;
  }
}

</style>
 
