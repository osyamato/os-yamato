<template>
  <EffectOverlay>
    <ChatEffect />
  </EffectOverlay>

  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { i18n } from '@/i18n'
import EffectOverlay from '@/components/EffectOverlay.vue'
import ChatEffect from '@/components/ChatEffect.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { listChatRooms } from '@/graphql/queries'

const notificationStore = useNotificationStore()

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()

    // ✅ アイコン色の設定
    const iconColor = user.attributes['custom:iconColor'] || '#274c77'
    document.documentElement.style.setProperty('--yamato-button-color', iconColor)

    // ✅ 言語の設定
    const supportedLocales = ['ja', 'en', 'es', 'zh']
    const userLang = user.attributes['custom:language']
    const savedLang = localStorage.getItem('locale')

    const preferredLang =
      supportedLocales.includes(userLang) ? userLang :
      supportedLocales.includes(savedLang) ? savedLang :
      'ja'

    i18n.global.locale.value = preferredLang

    // ✅ 壁紙の設定とテキストカラー切り替え
    const wallpaper = user.attributes['custom:wallpaper'] || ''
    const colorMap = {
      'color.lightBlue': '#e0f7fa',
      'color.lightYellow': '#fff9c4',
      'color.lightPurple': '#f3e5f5',
      'color.grayDark': '#2e2e2e'
    }

    if (wallpaper.startsWith('image.')) {
      document.body.style.backgroundImage = `url('/wallpapers/${wallpaper}')`
      document.body.style.backgroundColor = ''
      document.body.setAttribute('data-bg', 'image')
    } else if (wallpaper.startsWith('color.')) {
      document.body.style.backgroundImage = 'none'
      document.body.style.backgroundColor = colorMap[wallpaper] || '#ffffff'
      document.body.setAttribute('data-bg', wallpaper) // ✅ ここ重要
    }

    // ✅ チャット未読チェック
    const mySub = user.attributes.sub
    const res = await API.graphql(graphqlOperation(listChatRooms, {
      filter: {
        or: [
          { user1: { eq: mySub } },
          { user2: { eq: mySub } }
        ]
      },
      limit: 50
    }))

    const rooms = res.data.listChatRooms.items || []

    let hasUnread = false
    for (const room of rooms) {
      if (!room.lastTimestamp || room.lastSenderId === mySub) continue

      const last = new Date(room.lastTimestamp)
      const readRaw = room.user1 === mySub ? room.lastReadAtUser1 : room.lastReadAtUser2
      if (!readRaw || last > new Date(readRaw)) {
        hasUnread = true
        break
      }
    }

    if (hasUnread) {
      notificationStore.setUnread()
    } else {
      notificationStore.clearUnread()
    }

  } catch (e) {
    console.warn('⚠️ ユーザー情報取得・未読チェック失敗または未ログイン', e)

    // ローカル保存言語の復元
    const savedLang = localStorage.getItem('locale')
    if (['ja', 'en', 'es', 'zh'].includes(savedLang)) {
      i18n.global.locale.value = savedLang
    }
  }
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif;
  background-color: #fff;
  color: var(--yamato-text-color, #222);
  transition: background-color 0.3s ease, color 0.3s ease;

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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

html, body, #app {
  height: 100%;
}

/* ✅ テキスト色のカスタム変数切り替え（背景色に応じて） */
body[data-bg="color.grayDark"] {
  --yamato-text-color: white;
}
body[data-bg="color.lightPurple"],
body[data-bg="color.lightBlue"],
body[data-bg="color.lightYellow"] {
  --yamato-text-color: black;
}
</style>

