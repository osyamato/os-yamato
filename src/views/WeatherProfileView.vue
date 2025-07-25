<template>
  <div class="profile-container">
    <h2>🌤️ プロフィール</h2>

    <div class="profile-card">
      <img v-if="profile.icon" :src="`/${profile.icon}`" class="profile-icon" />
      <h3>{{ profile.nickname || '（未設定）' }}</h3>
      <p><strong>Yamato ID:</strong> {{ profile.yamatoId || '（未設定）' }}</p>
      <p><strong>紹介文:</strong> {{ profile.bio || '（未設定）' }}</p>

      <button @click="showModal = true" class="edit-button">編集</button>
    </div>

    <!-- 編集モーダル -->
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
import { listWeatherProfiles } from '@/graphql/queries'
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
      // 初期プロファイルを空で用意
      profile.value = {
        id: '',
        sub,
        icon: '',
        nickname: '',
        yamatoId: '',
        bio: ''
      }
    }
  } catch (e) {
    console.error('❌ プロフィール取得エラー:', e)
  }
}

onMounted(fetchProfile)
</script>

<style scoped>
.profile-container {
  max-width: 500px;
  margin: auto;
  padding: 20px;
  font-family: system-ui;
}

.profile-card {
  text-align: center;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 12px;
  background: white;
}

.profile-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

.edit-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>

