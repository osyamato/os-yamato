<template>
  <Modal :visible="visible" @close="close">
    <transition name="fade-in">
      <div v-if="loaded" class="profile-modal" :class="{ dark: isDarkMode }">
        <!-- 👤 ヘッダー全体 -->
        <div class="profile-header">
          <!-- 📷 左寄せのアイコン -->
          <img
            v-if="iconUrl"
            :src="iconUrl"
            class="profile-icon"
            alt="icon"
          />
          <div v-else class="text-icon">
            {{ profile.nickname?.charAt(0) || "?" }}
          </div>

          <!-- 🏷️ 中央上部のニックネーム -->
          <h3 class="profile-nickname">{{ profile.nickname || '匿名ユーザー' }}</h3>
        </div>

        <!-- 🆔 Yamato ID -->
        <p class="profile-id" v-if="profile.yamatoId">@{{ profile.yamatoId }}</p>

        <!-- 📖 自己紹介 -->
        <p class="profile-bio" v-if="profile.bio">{{ profile.bio }}</p>

        <!-- 🔗 ホームページ -->
        <p class="profile-homepage" v-if="profile.homepage">
          🔗 <a :href="profile.homepage" target="_blank">{{ profile.homepage }}</a>
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
const emit = defineEmits(['close'])

const profile = ref({})
const loaded = ref(false)

const iconUrl = computed(() => {
  return profile.value.icon ? `/${profile.value.icon}` : ''
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
</script>

<style scoped>
/* 🎞️ フェードイン */
.fade-in-enter-active {
  transition: opacity 0.6s ease;
}
.fade-in-enter-from {
  opacity: 0;
}
.fade-in-enter-to {
  opacity: 1;
}

/* 💠 全体 */
.profile-modal {
  padding: 20px;
  border-radius: 16px;
  max-width: 420px;
  margin: 0 auto;
  background: transparent;
  color: inherit;
}
.profile-modal.dark {
  color: white;
}
.profile-modal.dark .text-icon {
  background-color: #444;
}

/* 👤 ヘッダー（アイコン＋ニックネーム） */
.profile-header {
  position: relative;
  text-align: center;
  margin-bottom: 1.2rem;
}

/* 📷 左寄せアイコン */
.profile-icon,
.text-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  position: absolute;
  left: 0;
  top: 0;
}

/* 🏷️ ニックネーム（中央） */
.profile-nickname {
  margin: 0;
  font-size: 1.3rem;
  font-weight: bold;
}

/* 🆔 Yamato ID */
.profile-id {
  text-align: center;
  font-size: 0.9rem;
  color: inherit;
  opacity: 0.6;
  margin-bottom: 10px;
}

/* 📖 自己紹介 */
.profile-bio {
  margin: 10px 0;
  font-style: italic;
  color: inherit;
  opacity: 0.8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  text-align: center;
}

/* 🔗 ホームページ */
.profile-homepage {
  text-align: center;
  font-size: 0.85rem;
  color: inherit;
  opacity: 0.7;
  margin-top: 6px;
  word-break: break-all;
}

.profile-homepage a {
  color: #1e90ff; /* 青系リンク */
  text-decoration: underline;
}
</style>

