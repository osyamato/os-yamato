<template>
  <!-- ✅ アニメーション専用オーバーレイ -->
  <EffectOverlay>
    <ChatEffect />
  </EffectOverlay>

  <!-- アプリ本体 -->
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { i18n } from '@/i18n'
import EffectOverlay from '@/components/EffectOverlay.vue'
import ChatEffect from '@/components/ChatEffect.vue'

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()

    const iconColor = user.attributes['custom:iconColor'] || '#274c77'
    document.documentElement.style.setProperty('--yamato-button-color', iconColor)

    const userLang = user.attributes['custom:language']
    if (userLang === 'en' || userLang === 'ja') {
      i18n.global.locale.value = userLang
    }

  } catch (e) {
    console.warn('⚠️ ユーザー情報の取得失敗または未ログイン', e)
  }
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif;
  background-color: #fff;
  color: #222;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #ddd;
  }
}
</style> 

