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
    <div class="my-comments-section">
      <h3>あなたの投稿</h3>
      <div v-if="myComments.length === 0">投稿がありません</div>
      <div v-else class="comment-list">
        <div v-for="c in myComments" :key="c.id" class="comment-card">
          <p><strong>天気:</strong> {{ c.weather }} / <strong>{{ c.temperature }}°C</strong> / {{ c.timeOfDay }}時</p>
          <p>{{ c.comment }}</p>
        </div>
      </div>
    </div>

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
      filter: { owner: { eq: sub } }, // ✅ owner に修正！
      sortDirection: 'DESC'
    }))
    myComments.value = res.data.listWeatherComments.items
  } catch (e) {
    console.error('❌ コメント取得エラー:', e)
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  text-align: center;
  color: black;
  background-color: white;
  animation: none;
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

.my-comments-section {
  margin-top: 40px;
  text-align: left;
  padding: 0 20px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.comment-card {
  background: #f0f0f0;
  padding: 12px;
  border-radius: 10px;
}

.profile-container.dark .comment-card {
  background: #222;
}
</style>
