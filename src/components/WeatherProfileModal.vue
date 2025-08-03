<template>
  <Modal :visible="visible" @close="close" @after-leave="handleAfterLeave">
    <transition name="fade-in">
      <div v-if="loaded" class="profile-modal" :class="{ dark: isDarkMode }">
        <!-- 👤 アイコン＋ニックネーム横並び -->
        <div class="profile-header">
          <img
            v-if="iconUrl"
            :src="iconUrl"
            class="profile-icon"
            alt="icon"
          />
          <div v-else class="text-icon">
            {{ profile.nickname?.charAt(0) || "?" }}
          </div>
          <h3 class="profile-nickname">{{ profile.nickname || '匿名ユーザー' }}</h3>
        </div>

        <!-- 🆔 Yamato ID -->
        <p class="profile-id" v-if="profile.yamatoId">@{{ profile.yamatoId }}</p>

        <!-- 📖 自己紹介 -->
        <p class="profile-bio" v-if="profile.bio">{{ profile.bio }}</p>

        <!-- 🔗 ホームページ -->
        <p class="profile-homepage" v-if="homepageUrl">
          🔗 <a :href="homepageUrl" target="_blank">{{ homepageUrl }}</a>
        </p>
      </div>
    </transition>
  </Modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { getWeatherProfile } from '@/graphql/queries'
import Modal from '@/components/Modal.vue'
import { useWallpaper } from '@/composables/useWallpaper'
import { useI18n } from 'vue-i18n'

const { isDarkMode } = useWallpaper()
const { t } = useI18n()

const props = defineProps({
  userSub: String,
  visible: Boolean
})
const emit = defineEmits(['close', 'back']) // ✅ 追加

const profile = ref({})
const loaded = ref(false)

const iconUrl = computed(() => {
  return profile.value.icon ? `/${profile.value.icon}` : ''
})

const homepageUrl = computed(() => {
  const raw = profile.value.homepage?.trim()
  if (!raw) return null
  return raw.startsWith('http://') || raw.startsWith('https://')
    ? raw
    : `https://${raw}`
})

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    loaded.value = false
    await fetchProfile()
    loaded.value = true
  }
})

async function fetchProfile() {
  if (props.userSub) {
    try {
      const res = await API.graphql(graphqlOperation(getWeatherProfile, { id: props.userSub }))
      profile.value = res.data.getWeatherProfile || {}
    } catch (e) {
      console.error('プロフィール取得エラー:', e)
    }
  }
}

function close() {
  emit('close')
}

// ✅ モーダル閉じた直後に "back" を emit
function handleAfterLeave() {
  emit('back')
}
</script>

<style scoped>
.fade-in-enter-active {
  transition: opacity 0.6s ease;
}
.fade-in-enter-from {
  opacity: 0;
}
.fade-in-enter-to {
  opacity: 1;
}

.profile-modal {
  padding: 20px;
  border-radius: 16px;
  max-width: 420px;
  margin: 0 auto;
  background: transparent;
  color: inherit;
  position: relative;
}

.profile-modal.dark {
  color: white;
}
.profile-modal.dark .text-icon {
  background-color: #444;
}

/* 👤 アイコンとニックネームを横並び */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 1rem;
  margin-bottom: 1.2rem;
}

.profile-icon,
.text-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
}

.profile-nickname {
  font-size: 1.3rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.profile-id {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.6;
  margin-bottom: 10px;
}

.profile-bio {
  text-align: center;
  font-style: italic;
  opacity: 0.8;
  margin-bottom: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.profile-homepage {
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.7;
  word-break: break-all;
}

.profile-homepage a {
  color: #1e90ff;
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999; /* ✅ 追加して前面に出す！ */
}

</style>

