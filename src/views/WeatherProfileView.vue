<template>
  <div class="profile-container" :class="{ dark: isDarkMode }">
    <div v-if="profileLoaded" class="fade-in">
      <!-- 🌤️ タイトル -->
      <h2 class="title">プロフィール</h2>

      <!-- ✏️ 編集ボタン -->
      <div class="icon-buttons">
        <button
          class="edit-icon"
          @click="showModal = true"
          :style="{ backgroundColor: iconColor }"
        >
          ✏️
        </button>
      </div>

      <!-- 🧑‍ 左: アイコン | 右: テキスト情報 -->
      <div class="profile-layout">
        <!-- 左：アイコン -->
        <div class="profile-icon-wrapper">
          <img
            v-if="profile.icon"
            :src="`/${profile.icon}`"
            class="profile-icon"
            :alt="profile.nickname"
          />
          <div v-else class="profile-placeholder">
            {{ profile.nickname?.charAt(0) || '？' }}
          </div>
        </div>

        <!-- 右：名前・紹介文・ID -->
        <div class="profile-info">
          <h3>{{ profile.nickname || '（未設定）' }}</h3>
          <p class="bio-text">{{ profile.bio || '（未設定）' }}</p>
          <p class="yamato-id"><strong>Yamato ID:</strong> {{ profile.yamatoId || '（未設定）' }}</p>
        </div>
      </div>
    </div>

    <!-- 📬 投稿コメント一覧 -->
<h4 class="my-comments-title">あなたの投稿</h4>
<div class="comment-list">
  <div
    v-for="comment in myComments"
    :key="comment.id"
    class="comment-card"
  >
    <!-- 本文（上に表示） -->
    <p class="comment-content">{{ comment.content }}</p>

    <!-- 📷 アイコン（画像がある場合のみ） -->
    <span
      v-if="comment.imageUrl"
      class="photo-icon"
      @click="openImageModal(comment.imageUrl)"
    >
      📷
    </span>

    <!-- メタ情報 -->
    <p class="comment-meta">
      {{ comment.weather }} / {{ comment.temperature }}°C /
      {{ formatHour(comment.timeOfDay) }}時 / {{ getLangName(comment.language) }}
    </p>

    <!-- ⋯ 削除アイコン（右下に配置） -->
    <span class="more-icon" @click="openDeleteDialog(comment)">⋯</span>
  </div>
</div>

<ImageModal
  :visible="showImageModal"
  :imageUrl="selectedImageUrl"
  @close="showImageModal = false"
/>

<ConfirmDialog
  :visible="showConfirmDialog"
  message="このコメントを削除しますか？"
  @confirm="deleteComment"
  @cancel="showConfirmDialog = false"
/>

    <!-- ✏️ 編集モーダル -->
    <EditWeatherProfileModal
      :visible="showModal"
      :profile="profile"
      @close="showModal = false"
      @refresh="fetchProfile"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listWeatherProfiles, listWeatherComments } from '@/graphql/queries'
import EditWeatherProfileModal from '@/components/EditWeatherProfileModal.vue'
import { Storage } from 'aws-amplify'
import ImageModal from '@/components/ImageModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { deleteWeatherComment } from '@/graphql/mutations'


const showConfirmDialog = ref(false)
const commentToDelete = ref(null)

function openDeleteDialog(comment) {
  commentToDelete.value = comment
  showConfirmDialog.value = true
}

async function deleteComment() {
  try {
    await API.graphql(graphqlOperation(deleteWeatherComment, {
      input: { id: commentToDelete.value.id }
    }))
    myComments.value = myComments.value.filter(c => c.id !== commentToDelete.value.id)
    showConfirmDialog.value = false
  } catch (e) {
    console.error('❌ 削除失敗:', e)
  }
}
const showModal = ref(false)
const profile = ref({
  id: '',
  sub: '',
  icon: '',
  nickname: '',
  yamatoId: '',
  bio: ''
})
const myComments = ref([])

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
const iconColor = ref('#274c77')
const profileLoaded = ref(false)

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const user = await Auth.currentAuthenticatedUser()
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
  await fetchProfile()
  await fetchMyComments()
})

async function fetchProfile() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub

    const res = await API.graphql(graphqlOperation(listWeatherProfiles, {
      filter: { sub: { eq: sub } }
    }))

    const items = res.data.listWeatherProfiles.items
    if (items.length > 0) {
      profile.value = items[0]
    } else {
      profile.value = {
        id: '',
        sub,
        icon: '',
        nickname: '',
        yamatoId: '',
        bio: ''
      }
    }
    profileLoaded.value = true
  } catch (e) {
    console.error('❌ プロフィール取得エラー:', e)
  }
}

async function fetchMyComments() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub
    const res = await API.graphql(graphqlOperation(listWeatherComments, {
      filter: { owner: { eq: sub } },
      sortDirection: 'DESC'
    }))

    const items = res.data.listWeatherComments.items

    // 🔁 imageKey がある場合は URL を取得
    for (const item of items) {
      if (item.imageKey) {
        try {
          item.imageUrl = await Storage.get(item.imageKey)
        } catch (e) {
          console.warn('⚠️ 画像取得失敗:', item.imageKey)
        }
      }
    }

    myComments.value = items
  } catch (e) {
    console.error('❌ コメント取得エラー:', e)
  }
}

function formatHour(hour) {
  return Math.floor(hour)
}

function getLangName(code) {
  switch (code) {
    case 'ja': return '日本語'
    case 'en': return 'English'
    case 'zh': return '中文'
    case 'es': return 'Español'
    default: return code
  }
}


const showImageModal = ref(false)
const selectedImageUrl = ref('')

function openImageModal(url) {
  selectedImageUrl.value = url
  showImageModal.value = true
}

</script>

<style scoped>
.profile-container {
  padding: 20px;
  text-align: center;
  color: black;
  background-color: white;
}

.profile-container.dark {
  background-color: #111;
  color: white;
}

.fade-in {
  animation: fadeInFromTop 0.7s ease-in-out;
}

@keyframes fadeInFromTop {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.icon-buttons {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  margin-bottom: 20px;
}

.edit-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 24px;
  margin-bottom: 16px;
}

.profile-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  font-size: 28px;
  color: white;
  background-color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  text-align: left;
  max-width: 260px;
}

.bio-text {
  font-size: 16px;
  margin-top: 8px;
  word-break: break-word;
}

.yamato-id {
  font-size: 15px;
  margin-top: 8px;
}

.my-comments-title {
  font-size: 1.2rem;
  margin-top: 40px;
  margin-bottom: 12px;
  text-align: left;
  padding: 0 20px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px;
  align-items: center; /* 中央揃え */
}

.comment-card {
  position: relative;
  padding: 0.6rem 0.8rem;
  background: #fdfdfd; /* 柔らかい白 */
  border: 1px solid #bbb; /* 見えやすい枠線 */
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); /* やや浮かせる */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.9rem;
  color: #000;
  cursor: default;
  width: 330px;
  min-height: 90px;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow: hidden;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .comment-card {
    width: 400px;
  }
}

@media (min-width: 1024px) {
  .comment-card {
    width: 480px;
  }
}

.profile-container.dark .comment-card {
  background: #2c2c2c;
  color: #f5f5f5;
  border: 1px solid #555;
  box-shadow: none; /* ダークでは影を控えめに */
}

.comment-content {
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  margin-bottom: 6px; /* ✅ メタ情報との余白 */
}

.comment-meta {
  font-size: 13px;
  color: #555;
}

.profile-container.dark .comment-card {
  background: #222;
  color: white;
}

.profile-container.dark .comment-content {
  color: white;
}

.profile-container.dark .comment-meta {
  color: #ccc;
}

.photo-icon {
  margin: 4px 0 6px;
  font-size: 17px;
  cursor: pointer;
}

.more-icon {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}

.profile-container.dark .more-icon {
  color: #aaa;
}

</style>



