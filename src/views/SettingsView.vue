<template>
  <div class="settings">
    <h2>{{ t('title') }}</h2>

    <div class="setting-group">
      <label for="language">{{ t('languageLabel') }}</label>
      <select v-model="selectedLanguage" id="language">
        <option disabled value="">{{ t('selectLanguage') }}</option>
        <option value="ja">{{ t('japanese') }}</option>
        <option value="en">{{ t('english') }}</option>
      </select>
    </div>

    <div class="setting-group">
      <label for="wallpaper">{{ t('wallpaperLabel') }}</label>
      <select v-model="selectedWallpaper" id="wallpaper">
        <option disabled value="">{{ t('selectWallpaper') }}</option>
        <option value="">{{ t('none') }}</option>
        <option value="image.moon.png">{{ t('moon') }}</option>
        <option value="image.take.png">{{ t('take') }}</option>
        <option value="color.lightBlue">{{ t('lightBlue') }}</option>
        <option value="color.lightYellow">{{ t('lightYellow') }}</option>
        <option value="color.lightPurple">{{ t('lightPurple') }}</option>
      </select>
    </div>

    <div v-if="selectedWallpaper && !selectedWallpaper.startsWith('color.')">
      <p>{{ t('preview') }}</p>
      <img :src="`/${selectedWallpaper}`" class="preview" alt="Preview" />
    </div>

    <div class="button-container">
      <YamatoButton @click="saveSettings">{{ t('save') }}</YamatoButton>
    </div>

    <div class="account-row" @click="goToAccount">
      <span class="account-text">{{ t('account') }}</span>
      <div class="account-icon">→</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import YamatoButton from '@/components/YamatoButton.vue'

const router = useRouter()

const selectedLanguage = ref('')
const selectedWallpaper = ref('')

const locale = {
  ja: {
    title: '設定',
    languageLabel: '言語を選択:',
    selectLanguage: '-- 言語を選んでください --',
    wallpaperLabel: '壁紙を選択:',
    selectWallpaper: '-- 壁紙を選んでください --',
    moon: '月夜（moon）',
    take: '竹（take）',
    none: '背景なし',
    lightBlue: '和色（淡青）',
    lightYellow: '和色（淡黄）',
    lightPurple: '和色（淡紫）',
    preview: '選択中のプレビュー:',
    save: '保存',
    japanese: '日本語',
    english: '英語',
    saveMessage: '設定を保存しました！',
    account: 'アカウント'
  },
  en: {
    title: 'Settings',
    languageLabel: 'Select Language:',
    selectLanguage: '-- Please choose a language --',
    wallpaperLabel: 'Select Wallpaper:',
    selectWallpaper: '-- Please choose a wallpaper --',
    moon: 'Moonlight',
    take: 'Bamboo',
    none: 'No Background',
    lightBlue: 'Wafu Light Blue',
    lightYellow: 'Wafu Light Yellow',
    lightPurple: 'Wafu Light Purple',
    preview: 'Current Preview:',
    save: 'Save',
    japanese: 'Japanese',
    english: 'English',
    saveMessage: 'Settings saved!',
    account: 'Account'
  }
}

function t(key) {
  return locale[selectedLanguage.value]?.[key] || key
}

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  selectedLanguage.value = user.attributes['custom:language'] || 'ja'
  selectedWallpaper.value = user.attributes['custom:wallpaper'] || ''
  document.body.setAttribute('data-bg', selectedWallpaper.value || '')
})

watch(selectedWallpaper, (val) => {
  document.body.setAttribute('data-bg', val || '')
})

async function saveSettings() {
  const user = await Auth.currentAuthenticatedUser()
  await Auth.updateUserAttributes(user, {
    'custom:language': selectedLanguage.value,
    'custom:wallpaper': selectedWallpaper.value
  })
  alert(t('saveMessage'))
}

function goToAccount() {
  router.push('/account')
}
</script>

<style scoped>
.settings h2 {
  text-align: center;
  font-size: 1.4rem;
  font-family: var(--yamato-font-title, 'serif');
  color: var(--yamato-primary);
  margin-bottom: 2rem;
}

.setting-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.setting-group label {
  min-width: 140px;
  font-weight: bold;
}

.setting-group select {
  flex: 1;
  max-width: 150px;
  padding: 0.2rem 0.6rem;
  font-size: 0.9rem;
  height: 2rem;
  border-radius: 6px;
}

.preview {
  width: 300px;
  height: auto;
  margin-top: 1rem;
  border-radius: 8px;
  border: 1px solid #aaa;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.yamato-button {
  background-color: #274c77;
  color: white;
  padding: 0.6rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.yamato-button:hover {
  background-color: #1e3a5f;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3rem;
  padding: 0 1rem;
  cursor: pointer;
  color: #ccc;
}

.account-text {
  font-size: 1rem;
}

.account-icon {
  background-color: #274c77;
  color: white;
  border-radius: 9999px;
  padding: 0.3rem 0.6rem;
  font-weight: bold;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.account-icon:hover {
  background-color: #1e3a5f;
}

.settings {
  animation: dropDown 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes dropDown {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

