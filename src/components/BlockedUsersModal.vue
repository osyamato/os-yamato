<template>
  <Modal :visible="visible" @close="$emit('close')" customClass="blocked-users-modal">
    <div class="modal-content">
      <h2 class="modal-title">☁️ {{ t('profile.blockedUsersTitle') }}</h2>

      <p v-if="!profiles.length" class="empty-text">
        {{ t('profile.noBlockedUsers') }}
      </p>

      <ul v-else class="blocked-list">
        <li v-for="(user, index) in profiles" :key="index" class="blocked-user">
          <img
            v-if="user.iconUrl"
            :src="user.iconUrl"
            class="user-icon"
            :alt="user.nickname"
          />
          <div v-else class="user-placeholder">
            {{ user.nickname?.charAt(0) || '？' }}
          </div>
          <span class="user-name">{{ user.nickname }}</span>
        </li>
      </ul>
    </div>
  </Modal>
</template>

<script setup>
import Modal from '@/components/Modal.vue'
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getWeatherProfile } from '@/graphql/queries'
import { API, graphqlOperation, Storage } from 'aws-amplify'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  blockedUsers: {
    type: Array,
    default: () => []
  }
})

const profiles = ref([])

// ✅ 非同期取得関数
async function fetchProfiles(subs) {
  const result = []
  for (const sub of subs) {
    try {
      const res = await API.graphql(graphqlOperation(getWeatherProfile, { id: sub }))
      const profile = res.data.getWeatherProfile
      if (profile) {
        let iconUrl = null
        if (profile.icon) {
          try {
            iconUrl = await Storage.get(profile.icon)
          } catch (e) {
            console.warn('アイコン取得失敗:', e)
          }
        }

        result.push({
          sub: profile.id,
          nickname: profile.nickname || '匿名',
          iconUrl
        })
      }
    } catch (err) {
      console.warn('プロフィール取得失敗:', err)
    }
  }
  profiles.value = result
}

// ✅ `visible` + `blockedUsers` の変更を同時に監視
watch(
  () => [props.visible, props.blockedUsers],
  async ([visible, blockedUsers]) => {
    if (visible && blockedUsers.length) {
      await fetchProfiles(blockedUsers)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.modal-content {
  text-align: center;
  padding: 1rem;
}

.modal-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.blocked-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.blocked-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.user-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #aaa;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 1rem;
}

/* 🌙 ダークモード対応 */
.blocked-users-modal.dark .modal-content {
  background-color: #222;
  color: white;
}
.blocked-users-modal.dark .user-placeholder {
  background-color: #555;
}
</style>

