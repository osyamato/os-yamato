<template>
<div :class="['settings', { dropDown: shouldAnimate }]">
    <h2>{{ t('title') }}</h2>

    <!-- 🇾有 言語選択 -->
    <div class="setting-group">
<label for="language">
  {{ t('languageLabel') }} 🌐
</label>
<select v-model="selectedLanguage" id="language">
  <option disabled value="">{{ t('selectLanguage') }}</option>
  <option value="ja">{{ t('japanese') }}</option>
  <option value="en">{{ t('english') }}</option>
  <option value="zh">{{ t('chinese') }}</option>
  <option value="es">{{ t('spanish') }}</option>
  <option value="fr">{{ t('french') }}</option> <!-- ✅ フランス語を追加 -->
  <option value="id">{{ t('indonesian') }}</option> <!-- ✅ インドネシア語を追加 -->
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

    <!-- 🗾️ 壁紙選択 -->
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
<option value="color.gray">{{ t('gray') }}</option>
<option value="image.bubble.png">{{ t('bubble') }}</option>
<option value="effect.sakura">{{ t('sakura') }}</option>
      </select>
    </div>

<div class="setting-group horizontal-toggle">
<span class="label-text">{{ t('homeButton') }}</span>
  <div class="toggle-options">
    <div
      :class="['toggle-option', { active: showHomeButton === false }]"
      @click="showHomeButton = false"
    >
      OFF
    </div>
    <div
      :class="['toggle-option', { active: showHomeButton === true }]"
      @click="showHomeButton = true"
    >
      ON
    </div>
  </div>
</div>

<div class="setting-group horizontal-toggle">
  <span class="label-text">{{ t('messageAnimationLabel') }}</span>
  <div class="toggle-options">
    <div
      :class="['toggle-option', { active: messageAnimationEnabled === false }]"
      @click="messageAnimationEnabled = false"
    >
    OFF
    </div>
    <div
      :class="['toggle-option', { active: messageAnimationEnabled === true }]"
      @click="messageAnimationEnabled = true"
    >
      ON
    </div>
  </div>
</div>


    <!-- 💾 保存ボタン -->
    <div class="button-container">
      <YamatoButton :key="buttonKey" @click="saveSettings">{{ t('save') }}</YamatoButton>
    </div>

<!-- 🌿 Yamatoについてリンク -->
<div class="account-row">
  <span class="account-text">{{ t('about') }}</span>
  <IconButton :color="selectedColor" size="medium" @click="goToAbout"> > </IconButton>
</div>

<!-- 👤 アカウントリンク -->
<div class="account-row">
  <span class="account-text">{{ t('account') }}</span>
  <IconButton :color="selectedColor" size="medium" @click="goToAccount"> > </IconButton>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'
import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'
import { useRoute } from 'vue-router' 
import { nextTick } from 'vue'

const { t, locale } = useI18n()
const router = useRouter()
const selectedLanguage = ref('')
const selectedWallpaper = ref('')
const selectedColor = ref('')
const buttonKey = ref(0)


const selectedMessageAnimation = ref('on')
const messageAnimationEnabled = ref(true)

watch(messageAnimationEnabled, (enabled) => {
  selectedMessageAnimation.value = enabled ? 'on' : 'off'
})

const route = useRoute()               // ✅ 追加
const shouldAnimate = ref(false) 

const availableColors = [
  '#274c77', '#f7a3b3', '#fef3a3', '#c2f2d0',
  '#aedbff', '#d6bbf9', '#cccccc', '#ffd8a8', '#14532d'
]

const showHomeButton = ref(true)

onMounted(() => {
  const saved = localStorage.getItem('showHomeButton')
  showHomeButton.value = saved !== 'false' // 未設定なら true
})

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()

  // 各種属性を取得
  selectedLanguage.value = user.attributes['custom:language'] || 'ja'
  selectedWallpaper.value = user.attributes['custom:wallpaper'] || ''
  selectedColor.value = user.attributes['custom:iconColor'] || '#274c77'

  // ✅ メッセージアニメーション設定を取得（未設定なら true）
const animationAttr = user.attributes['custom:message_animation']
  messageAnimationEnabled.value = animationAttr !== 'off'

  // 言語・壁紙の初期化
  document.body.setAttribute('data-bg', selectedWallpaper.value || '')
  locale.value = selectedLanguage.value

  // ✅ アニメーション効果を一度だけ発火（ホームから来た場合）
  if (route.query.from === 'home') {
    await nextTick()
    shouldAnimate.value = true

    // クエリを消してURLをきれいに
    router.replace({ path: route.path })
  }
})

watch(selectedWallpaper, (val) => {
  document.body.setAttribute('data-bg', val || '')
})

function selectColor(color) {
  selectedColor.value = color
}

async function saveSettings() {
  const user = await Auth.currentAuthenticatedUser()
  await Auth.updateUserAttributes(user, {
    'custom:language': selectedLanguage.value,
    'custom:wallpaper': selectedWallpaper.value,
    'custom:iconColor': selectedColor.value,
    'custom:message_animation': selectedMessageAnimation.value || 'on'
  })

  // ✅ ホームボタン表示設定をローカルに保存
  localStorage.setItem('showHomeButton', showHomeButton.value)

  document.documentElement.style.setProperty('--yamato-button-color', selectedColor.value)
  locale.value = selectedLanguage.value
  buttonKey.value++

  alert(t('saveMessage'))

  // ✅ 反映のためページを再読み込み
  setTimeout(() => {
    window.location.reload()
  }, 300) // ちょっと間を空けると自然
}

function goToAccount() {
  router.push('/account')
}

function goToAbout() {
  router.push('/about')
}



</script>




<style scoped>
.settings h2 {
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #000; /* ライトモードでは黒 */
  margin-bottom: 2rem;
}

@media (prefers-color-scheme: dark) {
  .settings h2 {
    color: #fff; /* ダークモードでは白 */
  }
}

.setting-group {
  display: flex;
  align-items: flex-start; /* ← 上揃えから... */
  align-items: center;     /* ✅ 中央揃えに変更 */
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;         /* ← 狭い画面で折り返し対応 */
}

.setting-group label {
  min-width: 140px;
  font-weight: bold;
  color: #111; /* ← 追加：ライトモードで黒にする */
}

@media (prefers-color-scheme: dark) {
  .setting-group label {
    color: #fff; /* ← 追加：ダークモードで白にする */
  }
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


.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3rem;
  padding: 0.8rem 0.5rem;
  color: var(--yamato-primary); /* 他のラベルと同様に */
  font-weight: bold;
  font-size: 0.95rem;
  border-top: 1px solid #444;
}

.account-text {
  font-size: 1rem;
  font-weight: bold;
  color: #000; /* 通常は黒 */
}

/* ダークモードで白に */
@media (prefers-color-scheme: dark) {
  .account-text {
    color: #fff;
  }
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

.settings {
  padding-top: 2rem;
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
.color-options {
  display: flex;
  gap: 0.8rem;
}


.color-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* ← 3列 */
  gap: 0.8rem;
  justify-items: center;
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;                 /* ← グレーの縁を削除 */
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



/* 👇 アニメーションは dropDown クラスがついたときだけ */
.settings.dropDown {
  animation: dropDown 0.6s ease-out forwards;
}


.horizontal-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.label-text {
  font-weight: bold;
  color: #111; /* ライトモードでは黒 */
  font-size: 1rem;
  white-space: nowrap;
}

/* ダークモード時は白文字に */
@media (prefers-color-scheme: dark) {
  .label-text {
    color: #fff;
  }
}
.toggle-options {
  display: flex;
  gap: 6px;
}

.toggle-option {
  padding: 2px 10px; /* サイズ調整 */
  border-radius: 999px;
  border: 1.5px solid #888;
  color: #888;
  font-weight: 600;
  font-size: 0.75rem; /* フォントも少し小さめに */
  cursor: pointer;
  user-select: none;
  transition: 0.2s;
}

.toggle-option.active {
  background-color: #007aff;
  color: white;
  border-color: #007aff;
}

</style>

