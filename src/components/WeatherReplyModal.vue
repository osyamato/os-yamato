<template>
  <Modal :visible="visible" @close="handleClose">
    <div class="weather-reply-modal">
      <!-- 🌪️ スクロール領域 -->
      <div class="modal-scroll-area">
        <!-- 💬 親コメント -->
        <div class="parent-comment" v-if="parentComment?.content">
          <p class="parent-text">{{ parentComment.content }}</p>
        </div>

        <!-- 💬 既存リプライ一覧 -->
        <div class="reply-list" v-if="replies.length > 0">
          <div v-for="reply in replies" :key="reply.id" class="reply-item-row">
            <!-- 👤 アイコン -->
            <div class="reply-icon" @click="emitProfileOpen(reply.owner)">
              <template v-if="reply.icon && iconFilenames.includes(reply.icon)">
                <img
                  :src="getIconUrl(reply.icon)"
                  class="comment-icon clickable"
                  alt="icon"
                />
              </template>
              <template v-else>
                <span class="icon-initial">
                  {{ reply.ownerNickname?.charAt(0) || '❓' }}
                </span>
              </template>
            </div>

            <!-- 💬 本文とニックネーム -->
            <div class="reply-body" @click="emitProfileOpen(reply.owner)">
              <div class="nickname">{{ reply.ownerNickname }}</div>
              <p class="reply-text">{{ reply.content }}</p>
            </div>

            <!-- 🗑️ 削除ボタン -->
            <div v-if="reply.owner === currentSub" class="reply-menu">
<button class="delete-button" @click.stop="requestDelete(reply.id)">…</button>
            </div>
          </div>
        </div>
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
          :disabled="isSendDisabled"
          @click="submitReply"
        >
          ⇧
        </button>
      </div>

      <!-- ❓削除確認 -->
      <ConfirmDialog
        :visible="showConfirmDialog"
        :message="t('confirm.delete')"
        @confirm="deleteReply"
        @cancel="showConfirmDialog = false"
      />
    </div>
  </Modal>
</template>

<script setup lang="ts">

import { ref, watch, computed } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/Modal.vue'
import { createWeatherReply, deleteWeatherReply } from '@/graphql/mutations'
import { listWeatherReplies, getWeatherComment, getWeatherProfile } from '@/graphql/queries'
import ConfirmDialog from '@/components/ConfirmDialog.vue' 

const props = defineProps({
  visible: Boolean,
  commentId: String,
})

const emit = defineEmits(['close', 'open-profile'])
const { t, locale } = useI18n()

const replyContent = ref('')
const ownerNickname = ref('名無し')
const profileIcon = ref('weather.icon1.png')
const profileLoaded = ref(false)

const replies = ref([])
const parentComment = ref(null)
const textareaRef = ref(null)

const currentSub = ref('')
const selectedReplyId = ref('')
const showConfirmDialog = ref(false)

const iconFilenames = [
  'weather.icon1.png', 'weather.icon2.png', 'weather.icon3.png',
  'weather.icon4.png', 'weather.icon5.png', 'weather.icon6.png',
  'weather.icon7.png', 'weather.icon8.png', 'weather.icon9.png', 'weather.icon10.png'
]

function getIconUrl(fileName) {
  return fileName && iconFilenames.includes(fileName)
    ? `/${fileName}`
    : '/weather.icon1.png'
}

const isSendDisabled = computed(() => {
  return !replyContent.value.trim() || !profileLoaded.value
})

function emitProfileOpen(userSub: string) {
  emit('open-profile', userSub, true) // ← fromReply = true を渡す
}

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
    currentSub.value = sub
    const res = await API.graphql(graphqlOperation(getWeatherProfile, { id: sub }))
    const profile = res.data.getWeatherProfile
    if (profile) {
      ownerNickname.value = profile.nickname || '名無し'
      profileIcon.value = profile.icon || 'weather.icon1.png'
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
    const trimmed = replyContent.value.trim()
    if (!trimmed || !props.commentId) return

    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub

    const input = {
      commentId: props.commentId,
      owner: sub,
      ownerNickname: ownerNickname.value,
      icon: profileIcon.value,
      content: trimmed,
      language: locale.value,
      reported: false,
      reportReason: ''
    }

    await API.graphql(graphqlOperation(createWeatherReply, { input }))
    replyContent.value = ''
    await fetchReplies()
  } catch (err) {
    console.error('❌ Failed to submit reply:', JSON.stringify(err, null, 2))
  }
}

function requestDelete(replyId) {
  selectedReplyId.value = replyId
  showConfirmDialog.value = true
}

async function deleteReply() {
  try {
    if (!selectedReplyId.value) return
    await API.graphql(
      graphqlOperation(deleteWeatherReply, { input: { id: selectedReplyId.value } })
    )
    showConfirmDialog.value = false
    selectedReplyId.value = ''
    await fetchReplies()
  } catch (err) {
    console.error('❌ Failed to delete reply:', err)
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.commentId) {
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
  padding-right: 4px;
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
@media (prefers-color-scheme: dark) {
  .chat-textarea {
    background: #222;
    color: #eee;
    border-color: #555;
  }
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
  .send-button {
    color: #eee;
  }
}

.reply-icon {
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
  position: relative;
}

.reply-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.reply-item-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.5rem 0;
  position: relative;
}

.reply-icon {
  margin-right: 0.6rem;
  flex-shrink: 0;
}

.reply-body {
  flex-grow: 1;
  max-width: calc(100% - 4rem); /* アイコンと削除ボタン分 */
  cursor: pointer;
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

.comment-icon.clickable {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}

</style> 

