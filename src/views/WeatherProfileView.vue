<template>
  <div class="profile-container" :class="{ dark: isDarkMode }">
    <div v-if="profileLoaded" class="fade-in">
      <!-- 🌤️ タイトル -->
<h2 class="title">{{ t('profile.title') }}</h2>

      <!-- ✏️ 編集ボタン -->
<div class="icon-buttons">
  <!-- ☁️ ブロックリスト -->
  <button
    class="block-icon"
    @click="showBlockModal = true"
    :style="{ backgroundColor: iconColor }"
  >
    ☁️
  </button>

  <!-- 👤 編集 -->
  <button
    class="edit-icon"
    @click="showModal = true"
    :style="{ backgroundColor: iconColor }"
  >
    👤
  </button>
</div>

      <!-- 未登録時メッセージ -->
      <div v-if="!profile.nickname" class="unregistered-message">
        <p class="unregistered-message-text">{{ t('weather.unregistered') }}</p>
      </div>

      <!-- ✅ 登録済みプロフィール -->
      <div v-else class="profile-top">
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

        <!-- 中央：ニックネーム -->
        <h3 class="nickname">{{ profile.nickname }}</h3>
      </div>

      <!-- 🔤 自己紹介・ID・HP -->
      <div class="profile-info">
        <p v-if="profile.bio" class="bio-text">{{ profile.bio }}</p>
        <p v-if="profile.yamatoId" class="yamato-id">
          <strong>Yamato ID:</strong> {{ profile.yamatoId }}
        </p>
        <p v-if="profile.homepage" class="homepage">
          🔗 <a :href="profile.homepage" target="_blank" rel="noopener">{{ profile.homepage }}</a>
        </p>
      </div>
    </div>

    <!-- 📬 投稿コメント一覧 -->
    <div class="comment-list fade-in">
      <div
        v-for="(comment, index) in myComments"
        :key="comment.id"
        class="comment-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >

<div class="like-display">
<span class="reply-icon" @click="openReplyModal(comment)">💭</span>
  <span class="like-icon">♡</span>
  <span class="like-count">{{ comment.likeCount || 0 }}</span>
</div>

        <p class="comment-content">{{ comment.content }}</p>
        <span
          v-if="comment.imageUrl"
          class="photo-icon"
          @click="openImageModal(comment.imageUrl)"
        >
          📷
        </span>
        <p class="comment-meta">
          {{ t(`weatherMain.${comment.weather}`) }} /
          {{ comment.temperature }}°C /
          {{ formatHour(comment.timeOfDay) }}{{ t('weather.timeSuffix') }} /
          {{ getLangName(comment.language) }}
        </p>
        <span class="more-icon" @click="openDeleteDialog(comment)">⋯</span>
      </div>
    </div>

    <!-- 画像モーダル -->
    <ImageModal
      :visible="showImageModal"
      :imageUrl="selectedImageUrl"
      @close="showImageModal = false"
    />

    <!-- 削除確認 -->
    <ConfirmDialog
      :visible="showConfirmDialog"
      :message="t('confirm.delete')"
      @confirm="deleteComment"
      @cancel="showConfirmDialog = false"
    />

    <!-- 編集モーダル -->
    <EditWeatherProfileModal
      :visible="showModal"
      :profile="profile"
      @close="showModal = false"
      @refresh="fetchProfile"
    />

<WeatherProfileModal
  :userSub="selectedUserSub"
  :visible="showUserProfileModal"
  @close="showUserProfileModal = false"
  @back="showReplyModal = true"
/>


<MyWeatherReplyModal
  v-if="showReplyModal"
  :visible="showReplyModal"
  :comment-id="replyingToCommentId"
  @close="closeReplyModal"
  @open-profile="openUserProfile"
/>
<BlockedUsersModal
  :visible="showBlockModal"
  :blocked-users="blockedUsers"
  @close="showBlockModal = false"
/>

  </div>
</template>


<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import { ref, computed, onMounted, watch } from 'vue'
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify'
import { getWeatherProfile, listWeatherComments } from '@/graphql/queries'
import { deleteWeatherComment } from '@/graphql/mutations'
import EditWeatherProfileModal from '@/components/EditWeatherProfileModal.vue'
import ImageModal from '@/components/ImageModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import MyWeatherReplyModal from '@/components/MyWeatherReplyModal.vue'
import WeatherProfileModal from '@/components/WeatherProfileModal.vue'
import BlockedUsersModal from '@/components/BlockedUsersModal.vue'

const selectedComment = ref(null)

// ✏️ 編集モーダルの表示状態
const showModal = ref(false)

const showBlockModal = ref(false)

// 📄 プロフィールデータ
const profile = ref({
  id: '',
  sub: '',
  icon: '',
  nickname: '',
  yamatoId: '',
  bio: '',
  homepage: ''   // ✅ 追加
})

const profileLoaded = ref(false)

// 📝 投稿コメント一覧
const myComments = ref([])

// 🖼️ 画像モーダル
const showImageModal = ref(false)
const selectedImageUrl = ref('')

// 🗑️ 削除確認モーダル
const showConfirmDialog = ref(false)
const commentToDelete = ref(null)

// 🎨 テーマ色
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
const iconColor = ref('#274c77')

// 🌱 初期化処理
onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const user = await Auth.currentAuthenticatedUser()
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
  await fetchProfile()
  await fetchMyComments()
})

// 🔍 プロフィール取得（id=sub 構成）
async function fetchProfile() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub

    const res = await API.graphql(graphqlOperation(getWeatherProfile, {
      id: sub
    }))
    const item = res.data.getWeatherProfile

    if (item) {
      profile.value = item
    } else {
      // 登録なし → 空のプロファイルを用意
profile.value = {
  id: '',
  sub,
  icon: '',
  nickname: '',
  yamatoId: '',
  bio: '',
  homepage: ''   // ✅ 追加
}
    }
    profileLoaded.value = true
  } catch (e) {
    console.error('❌ プロフィール取得失敗:', e)
    profileLoaded.value = true
  }
}

// 📝 コメント取得
async function fetchMyComments() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub

    const res = await API.graphql(graphqlOperation(listWeatherComments, {
      filter: { owner: { eq: sub } },
      sortDirection: 'DESC'
    }))

    const items = res.data.listWeatherComments.items

    // 画像がある場合は URL を取得
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
    console.error('❌ コメント取得失敗:', e)
  }
}

const showReplyModal = ref(false)
const replyingToCommentId = ref<string | null>(null)

function openReplyModal(comment) {
  replyingToCommentId.value = comment.id
  showReplyModal.value = true
}

function closeReplyModal() {
  showReplyModal.value = false
  replyingToCommentId.value = null
}

// 🕒 時間整形
function formatHour(hour) {
  return Math.floor(hour)
}

// 🌐 言語名変換
function getLangName(code) {
  switch (code) {
    case 'ja': return '日本語'
    case 'en': return 'English'
    case 'zh': return '中文'
    case 'es': return 'Español'
    default: return code
  }
}

// 🖼️ モーダルを開く
function openImageModal(url) {
  selectedImageUrl.value = url
  showImageModal.value = true
}

// 🗑️ コメント削除確認
function openDeleteDialog(comment) {
  commentToDelete.value = comment
  showConfirmDialog.value = true
}

// 🗑️ コメント削除処理
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

const showUserProfileModal = ref(false) // ←これに変更
const selectedUserSub = ref('')

function openUserProfile(userSub) {
  showReplyModal.value = false // ✅ これを必ず先に閉じる
  selectedUserSub.value = userSub
  showUserProfileModal.value = true
}


defineExpose({ openUserProfile })


const blockedUsers = computed(() =>
  profile.blockedSubs
    ?.map(sub => userMap.value[sub])
    .filter(user => !!user) || []
)

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
  justify-content: center; /* 中央寄せ */
  align-items: center;
  gap: 16px; /* ボタン同士の間隔 */
  margin: 16px 0 20px;
}

.edit-icon,
.block-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #888; /* または iconColor を style で渡す */
}

.profile-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 20px;
  margin-bottom: 16px;
}

.profile-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 20px;
  color: white;
  background-color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nickname {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.profile-info {
  text-align: center;
  max-width: 300px;
  margin: 0 auto 20px;
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

.homepage {
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--link-color, #007acc);
  word-break: break-all;
}

.homepage a {
  text-decoration: underline;
  color: inherit;
}

/* コメントカード */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px;
  align-items: center;
}

.comment-card {
  position: relative;
  padding: 0.6rem 0.8rem;
  background: #fdfdfd;
  border: 1px solid #bbb;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.9rem;
  color: #000;
  width: 330px;
  min-height: 90px;
  box-sizing: border-box;
  overflow: hidden;
  margin: 0 auto;

  /* ✅ ライトモードでは outline を削除、シャドウを柔らかく */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 10px rgba(0, 0, 0, 0.1);
}

.profile-container.dark .comment-card {
  background: #2c2c2c;
  color: #f5f5f5;
  border: 1px solid #555;

  /* ✅ ダークモードは明るめの outline を維持しつつ浮かせる */
  box-shadow:
    0 0 4px rgba(255, 255, 255, 0.05),
    0 4px 14px rgba(0, 0, 0, 0.6);
  outline: 1px solid rgba(255, 255, 255, 0.05);
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

.like-display {
  position: absolute;
  top: 6px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 6px; /* 💭と♡と数字の間隔 */
}


.like-icon {
  color: #ff6688;
  font-size: 1.2rem;
  text-shadow: 0 0 1px white;
}

.like-count {
  font-size: 0.9rem;
  color: #ddd;
}


.comment-content {
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  margin-bottom: 6px;
  padding-right: 80px; /* 💭♡分の余白に拡大 */
}

.comment-meta {
  font-size: 13px;
  color: #555;
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

.unregistered-message-text {
  white-space: pre-line;
}

.reply-icon {
  font-size: 1.2rem;
  opacity: 0.7;
  color: #66bbff;
}
.profile-container.dark .reply-icon {
  color: #88ccff;
}

</style>



