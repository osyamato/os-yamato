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

        <!-- ☁️ ブロック / 解除 ボタン -->
        <div v-if="props.userSub && props.userSub !== mySub" class="block-button-wrapper">
<button class="block-button" @click="toggleBlock">
  ☁️
</button>
        </div>
      </div>
    </transition>
  </Modal>
</template>


<script setup>
import { ref, watch, computed } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { getWeatherProfile } from '@/graphql/queries'
import { updateWeatherProfile } from '@/graphql/mutations'
import { Auth } from 'aws-amplify'
import Modal from '@/components/Modal.vue'
import { useWallpaper } from '@/composables/useWallpaper'
import { useI18n } from 'vue-i18n'

const { isDarkMode } = useWallpaper()
const { t } = useI18n()

// Props & Emits
const props = defineProps({
  userSub: String,
  visible: Boolean
})
const emit = defineEmits(['close', 'back'])

// プロフィール情報
const profile = ref({})
const loaded = ref(false)
const mySub = ref('')
const isBlocked = ref(false)
const blockedSubs = ref([])

// アイコンURL
const iconUrl = computed(() => {
  return profile.value.icon ? `/${profile.value.icon}` : ''
})

// ホームページURLを整形
const homepageUrl = computed(() => {
  const raw = profile.value.homepage?.trim()
  if (!raw) return null
  return raw.startsWith('http://') || raw.startsWith('https://')
    ? raw
    : `https://${raw}`
})

// モーダルが開かれたときにプロフ取得＆ブロック状態確認
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    loaded.value = false
    await fetchMySub()
    await fetchProfile()
    await checkBlocked()
    loaded.value = true
  }
})

// 自分のSubを取得
async function fetchMySub() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    mySub.value = user.attributes.sub
  } catch (e) {
    console.error('自分のSub取得エラー:', e)
  }
}

// プロフィールを取得（対象ユーザーの）
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

// ブロック状態確認（自分のプロフィールを取得して照合）
async function checkBlocked() {
  try {
    const res = await API.graphql(graphqlOperation(getWeatherProfile, { id: mySub.value }))
    const myProfile = res.data.getWeatherProfile
    blockedSubs.value = myProfile?.blockedSubs || []
    isBlocked.value = blockedSubs.value.includes(props.userSub)
  } catch (e) {
    console.error('ブロック状態確認エラー:', e)
    isBlocked.value = false
  }
}

// ブロック切り替え
function toggleBlock() {
  const name = profile.value.nickname || 'このユーザー'
  const action = isBlocked.value
    ? 'このユーザーを雲から戻しますか？（ブロック解除）'
    : 'このユーザーを雲にかくしますか？（ブロック）'

  const confirmed = confirm(`${name} を${action}`)
  if (!confirmed) return

  if (isBlocked.value) {
    // 解除
    blockedSubs.value = blockedSubs.value.filter(sub => sub !== props.userSub)
    isBlocked.value = false
  } else {
    // ブロック
    blockedSubs.value.push(props.userSub)
    isBlocked.value = true
  }

  updateProfile()
}

// 自分のプロフィールを更新（blockedSubsだけ）
async function updateProfile() {
  try {
    await API.graphql(graphqlOperation(updateWeatherProfile, {
      input: {
        id: mySub.value,
        blockedSubs: blockedSubs.value
      }
    }))
  } catch (e) {
    console.error('プロフィール更新エラー:', e)
  }
}

// モーダル閉じる
function close() {
  emit('close')
}

// モーダル閉じたあとに back emit
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

.block-button-wrapper {
  text-align: center;
  margin-top: 12px;
}

.block-button {
  padding: 6px 12px;
  background-color: #eee;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}

.profile-modal.dark .block-button {
  background-color: #555;
  color: white;
}

</style>

