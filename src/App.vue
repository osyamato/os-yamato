<template>
  <EffectOverlay>
    <ChatEffect />
  </EffectOverlay>
<GlobalFixedHomeButton v-if="showHomeButton" />
  <div id="app">
    <router-view />
  </div>
</template>


<script setup>
import { useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { i18n } from '@/i18n'
import EffectOverlay from '@/components/EffectOverlay.vue'
import ChatEffect from '@/components/ChatEffect.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { listChatRooms } from '@/graphql/queries'
import GlobalFixedHomeButton from '@/components/GlobalFixedHomeButton.vue'

const notificationStore = useNotificationStore()
const route = useRoute()
const showHomeButton = ref(true)

onMounted(async () => {
  // ✅ ホームボタンの表示設定を localStorage から読み込む
  const savedHomeButton = localStorage.getItem('showHomeButton')
  showHomeButton.value = savedHomeButton !== 'false'

  try {
    const user = await Auth.currentAuthenticatedUser()

    // ✅ ボタン色の設定
    const iconColor = user.attributes['custom:iconColor'] || '#274c77'
    document.documentElement.style.setProperty('--yamato-button-color', iconColor)

    // ✅ 言語の設定（Amplify属性 > localStorage > fallback）
    const supportedLocales = ['ja', 'en', 'es', 'zh', 'fr', 'id']
    const userLang = user.attributes['custom:language']
    const savedLang = localStorage.getItem('locale')
    const preferredLang =
      supportedLocales.includes(userLang) ? userLang :
      supportedLocales.includes(savedLang) ? savedLang :
      'ja'
    i18n.global.locale.value = preferredLang

    // ✅ 起動時の未読チェック
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

    // 未ログイン時でも localStorage から言語を復元
    const supportedLocales = ['ja', 'en', 'es', 'zh', 'fr', 'id']
    const savedLang = localStorage.getItem('locale')
    if (supportedLocales.includes(savedLang)) {
      i18n.global.locale.value = savedLang
    }
  }
})

const hiddenRoutes = [
  '/signin',
  '/register',
  '/verify',
  '/forgot',
  '/transition'
]

function updateHomeButtonVisibility() {
  const saved = localStorage.getItem('showHomeButton')
  const userWantsButton = saved !== 'false'
  showHomeButton.value = userWantsButton && !hiddenRoutes.includes(route.path)
}
onMounted(() => {
  updateHomeButtonVisibility()
})

watch(() => route.path, () => {
  updateHomeButtonVisibility()
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

html, body, #app {
  height: 100%;
}
</style>
 
 

