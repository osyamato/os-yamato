<template>
  <Modal :visible="visible" @close="handleClose">
    <div class="weather-reply-modal">
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

      <!-- ✍️ 新規リプライ入力 -->
      <textarea
        v-model="replyContent"
        class="reply-textarea"
        :placeholder="t('weather.enterReply')"
        rows="3"
      />

      <div class="modal-actions">
        <YamatoButton
          @click="submitReply"
          :disabled="!replyContent.trim() || !profileLoaded"
        >
          {{ t('common.submit') }}
        </YamatoButton>
        <YamatoButton type="secondary" @click="handleClose">
          {{ t('common.cancel') }}
        </YamatoButton>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { createWeatherReply } from '@/graphql/mutations'
import { listWeatherReplies, getWeatherComment, getWeatherProfile } from '@/graphql/queries'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue'

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

function handleClose() {
  replyContent.value = ''
  replies.value = []
  parentComment.value = null
  emit('close')
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

.reply-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.reply-icon {
  width: 2rem;
  height: 2rem;
  margin-right: 0.6rem;
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
  flex: 1;
}

.nickname {
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.2rem;
}

@media (prefers-color-scheme: dark) {
  .nickname {
    color: #ddd;
  }
}

.reply-text {
  font-size: 1rem;
}

.reply-textarea {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: none;
  background: #fff;
  font-size: 1rem;
  margin-bottom: 1rem;
}

@media (prefers-color-scheme: dark) {
  .reply-textarea {
    background: #222;
    color: #eee;
    border: 1px solid #555;
  }
}

.no-reply {
  font-style: italic;
  text-align: center;
  margin-bottom: 1rem;
  color: #888;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
