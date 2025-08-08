<template>
  <Modal :visible="visible" @close="$emit('close')" customClass="blocked-users-modal">
    <div class="blocked-users-wrapper">
      <h2 class="modal-title">☁️ {{ t('profile.blockedUsersTitle') }}</h2>

      <p v-if="!profiles.length" class="empty-text">
        {{ t('profile.noBlockedUsers') }}
      </p>

      <ul v-else class="user-list">
        <li v-for="(user, index) in profiles" :key="index" class="user-name">
          <button class="unblock-button" @click="confirmUnblock(user.sub)">☀️</button>
          {{ user.nickname }}
        </li>
      </ul>
    </div>
  </Modal>
</template>

<script setup>
import Modal from '@/components/Modal.vue'
import { ref, watch } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'
import { getWeatherProfile, listWeatherProfiles } from '@/graphql/queries'
import { updateWeatherProfile } from '@/graphql/mutations'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close'])

const profiles = ref([])
const mySub = ref('')
const blockedSubs = ref([])

// 自分のsubを取得
async function fetchMySub() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    mySub.value = user.attributes.sub
  } catch (e) {
    console.error('❌ 自分のsub取得失敗:', e)
  }
}

// 自分のプロフィール（ブロック状態）取得
async function fetchMyProfile() {
  try {
    const res = await API.graphql(graphqlOperation(getWeatherProfile, { id: mySub.value }))
    const myProfile = res.data.getWeatherProfile
    blockedSubs.value = myProfile?.blockedSubs || []
  } catch (e) {
    console.error('❌ プロフィール取得失敗:', e)
    blockedSubs.value = []
  }
}

// ブロックしているユーザーのプロフィール取得
async function fetchProfiles() {
  if (!blockedSubs.value.length) {
    profiles.value = []
    return
  }

  try {
    const res = await API.graphql(graphqlOperation(listWeatherProfiles, {
      filter: {
        or: blockedSubs.value.map(sub => ({ id: { eq: sub } }))
      }
    }))
    profiles.value = res.data.listWeatherProfiles.items.map(item => ({
      sub: item.id,
      nickname: item.nickname || '匿名'
    }))
  } catch (e) {
    console.error('❌ プロフィール一覧取得失敗:', e)
  }
}

// ブロック解除確認
async function confirmUnblock(targetSub) {
  const user = profiles.value.find(p => p.sub === targetSub)
  const name = user?.nickname || 'このユーザー'
  const confirmed = confirm(`${name} をそっと戻しますか？`)
  if (!confirmed) return

  await removeFromBlocked(targetSub)
}

// ブロック解除処理
async function removeFromBlocked(subToRemove) {
  try {
    const updatedBlocked = blockedSubs.value.filter(sub => sub !== subToRemove)

    await API.graphql(graphqlOperation(updateWeatherProfile, {
      input: {
        id: mySub.value,
        blockedSubs: updatedBlocked
      }
    }))

    blockedSubs.value = updatedBlocked
    profiles.value = profiles.value.filter(p => p.sub !== subToRemove)
  } catch (e) {
    console.error('❌ ブロック解除失敗:', e)
  }
}

// モーダルが開いたら常に再取得
watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      profiles.value = []
      await fetchMySub()
      await fetchMyProfile()
      await fetchProfiles()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.blocked-users-wrapper {
  text-align: center;
  padding: 1.5rem 1rem;
}

.modal-title {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.empty-text {
  color: #888;
  font-size: 0.9rem;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-name {
  font-size: 1rem;
  padding: 0.6rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-bottom: 1px solid #666;
}

.unblock-button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

/* 🌙 ダークモード */
.blocked-users-modal.dark .blocked-users-wrapper {
  background-color: transparent;
  color: white;
}
.blocked-users-modal.dark .user-name {
  border-color: #444;
}
</style>

