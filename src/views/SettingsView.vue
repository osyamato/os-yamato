<template>
<div
    :class="['settings', { dropDown: shouldAnimate }]"
    :style="{
      backgroundColor: computedBgColor,
      backgroundImage: 'none'
    }"
  >
    <!-- 🏷️ タイトル -->
    <h2>{{ t('title') }}</h2>

    <!-- 🌐 言語選択 -->
    <div class="setting-group">
      <label for="language">{{ t('languageLabel') }} 🌐</label>
      <select v-model="selectedLanguage" id="language">
        <option disabled value="">{{ t('selectLanguage') }}</option>
        <option value="ja">{{ t('japanese') }}</option>
        <option value="en">{{ t('english') }}</option>
        <option value="zh">{{ t('chinese') }}</option>
        <option value="es">{{ t('spanish') }}</option>
      </select>
    </div>

    <!-- 🎨 アイコン色選択 -->
    <div class="setting-group">
      <label>{{ t('iconColorLabel') }}</label>
      <div class="color-picker-grid">
        <div
          v-for="color in availableColors"
          :key="color"
          class="color-circle"
          :style="{ backgroundColor: color }"
          :class="{ selected: selectedColor === color }"
          @click="selectColor(color)"
        />
      </div>
    </div>

    <!-- 🖼️ 壁紙選択 -->
    <div class="setting-group">
      <label for="wallpaper">{{ t('wallpaperLabel') }}</label>
      <select v-model="selectedWallpaper" id="wallpaper">
        <option disabled value="">{{ t('selectWallpaper') }}</option>
        <option value="">{{ t('none') }}</option>
        <option value="color.lightBlue">{{ t('lightBlue') }}</option>
        <option value="color.lightYellow">{{ t('lightYellow') }}</option>
        <option value="color.lightPurple">{{ t('lightPurple') }}</option>
        <option value="color.grayDark">{{ t('grayDark') }}</option>
      </select>
    </div>

    <!-- 💾 保存ボタン -->
    <div class="button-container">
      <YamatoButton :key="buttonKey" @click="saveSettings">{{ t('save') }}</YamatoButton>
    </div>

    <!-- 🌿 Yamatoについて -->
    <div class="account-row" @click="goToAbout">
      <span class="account-text">{{ t('about') }}</span>
      <IconButton :color="selectedColor" size="medium" @click="goToAbout"> > </IconButton>
    </div>

    <!-- 👤 アカウント -->
    <div class="account-row" @click="goToAccount">
      <span class="account-text">{{ t('account') }}</span>
      <IconButton :color="selectedColor" size="medium" @click="goToAccount"> > </IconButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'
import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'
import { nextTick } from 'vue'
import { useWallpaperStore } from '@/stores/wallpaperStore'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const selectedLanguage = ref('')
const selectedWallpaper = ref('')
const selectedColor = ref('')
const buttonKey = ref(0)
const shouldAnimate = ref(false)

const wallpaperStore = useWallpaperStore()

const availableColors = [
  '#274c77', '#f7a3b3', '#fef3a3', '#c2f2d0',
  '#aedbff', '#d6bbf9', '#cccccc', '#ffd8a8', '#14532d'
]

// ✅ 背景色を selectedWallpaper に基づいて計算
const computedBgColor = computed(() => {
  const map = {
    'color.lightBlue': '#e0f7fa',
    'color.lightYellow': '#fff9c4',
    'color.lightPurple': '#f3e5f5',
    'color.grayDark': '#2e2e2e'
  }
  return map[selectedWallpaper.value] || 'transparent'
})

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  selectedLanguage.value = user.attributes['custom:language'] || 'ja'
  selectedWallpaper.value = user.attributes['custom:wallpaper'] || ''
  selectedColor.value = user.attributes['custom:iconColor'] || '#274c77'

  document.body.setAttribute('data-bg', selectedWallpaper.value || '')
  wallpaperStore.setWallpaper(selectedWallpaper.value)

  await nextTick()
  locale.value = selectedLanguage.value

  if (route.query.from === 'home') {
    await nextTick()
    shouldAnimate.value = true
    router.replace({ path: route.path })
  }
})

watch(selectedWallpaper, (val) => {
  const colorMap = {
    'color.lightBlue': '#e0f7fa',
    'color.lightYellow': '#fff9c4',
    'color.lightPurple': '#f3e5f5',
    'color.grayDark': '#2e2e2e'
  }
  const bg = colorMap[val] || 'transparent'
  document.body.style.backgroundColor = bg
  document.body.setAttribute('data-bg', val || '')
  wallpaperStore.setWallpaper(val)
})

function selectColor(color) {
  selectedColor.value = color
}

async function saveSettings() {
  const user = await Auth.currentAuthenticatedUser()
  await Auth.updateUserAttributes(user, {
    'custom:language': selectedLanguage.value,
    'custom:wallpaper': selectedWallpaper.value,
    'custom:iconColor': selectedColor.value
  })

  document.body.setAttribute('data-bg', selectedWallpaper.value || '')
  wallpaperStore.setWallpaper(selectedWallpaper.value)

  document.documentElement.style.setProperty('--yamato-button-color', selectedColor.value)
  locale.value = selectedLanguage.value
  buttonKey.value++
  alert(t('saveMessage'))
}

function goToAccount() {
  router.push('/account')
}
function goToAbout() {
  router.push('/about')
}
</script>


<style>
.settings {
  padding-top: 2rem;
  max-width: 600px;
  margin: 0 auto;
  color: var(--yamato-text-color); /* ✅ 背景に応じた文字色 */
}

/* アニメーション */
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
.settings.dropDown {
  animation: dropDown 0.6s ease-out forwards;
}

.settings h2 {
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  margin-bottom: 2rem;
}

.setting-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: nowrap; /* ✅ スマホでも折り返さない */
}

.setting-group label {
  min-width: 140px;
  font-weight: bold;
}

.setting-group select {
  flex: none;
  width: 150px;
  padding: 0.2rem 0.6rem;
  font-size: 0.9rem;
  height: 2rem;
  border-radius: 6px;
  background-color: transparent;
  color: inherit; /* ✅ テキスト色継承 */
  border: 1px solid #999;
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

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3rem;
  padding: 0.8rem 0.5rem;
  color: var(--yamato-primary);
  font-weight: bold;
  font-size: 0.95rem;
  border-top: 1px solid #444;
}

.account-text {
  font-size: 1rem;
  font-weight: bold;
  color: inherit; /* ✅ テキスト色継承 */
}

.account-icon {
  background-color: #274c77;
  color: white;
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  font-weight: bold;
  font-size: 1.1rem;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}
.account-row:hover .account-icon {
  background-color: #1e3a5f;
}

.color-options {
  display: flex;
  gap: 0.8rem;
}

.color-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  justify-items: center;
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-circle.selected {
  box-shadow: 0 0 0 2px white, 0 0 0 4px black;
}

.color-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
  text-align: left;
}

.setting-group.vertical {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

/* ✅ ダークモード以外の背景では text を黒に */
body:not([data-bg='color.grayDark']) .account-text {
  color: #111 !important;
}

/* ✅ ダークモードでは text を白に */
body[data-bg='color.grayDark'] .account-text {
  color: white !important;
}

</style>

