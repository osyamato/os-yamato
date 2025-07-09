<template>
  <div class="desktop" :style="wallpaperStyle">
    <div class="icon-grid">
      <!-- ✅ カレンダー（文字オーバーレイのため特殊対応） -->
      <button @click="goTo('calendar')" class="icon-button calendar-button" style="background-image: url('/calendar.png')">
        <span class="calendar-date">{{ currentDay }}</span>
        <span class="calendar-month">{{ currentMonthName }}</span>
      </button>

      <!-- ✅ メモ -->
      <button @click="goTo('memo')" class="icon-button" style="background-image: url('/memo.icon.png')"></button>

      <!-- ✅ 連絡先 -->
      <button @click="goTo('contact')" class="icon-button" style="background-image: url('/contact.icon.png')"></button>

      <!-- ✅ 日記 -->
      <button @click="goTo('diary')" class="icon-button" style="background-image: url('/diary.icon.png')"></button>

      <!-- ✅ 写真 -->
      <button @click="goTo('photo')" class="icon-button" style="background-image: url('/photo.icon.png')"></button>

      <!-- ✅ 動画 -->
      <button @click="goTo('video')" class="icon-button" style="background-image: url('/video.png')"></button>

      <!-- ✅ メッセージ -->
      <button @click="goToChatFromHome" class="icon-button chat-button" style="background-image: url('/messege.icon.png')">
        <span v-if="notificationStore.hasUnread" class="notification-dot">🌱</span>
      </button>

      <!-- ✅ 風の便り -->
      <button @click="goTo('wind-inbox')" class="icon-button" style="background-image: url('/WindMessage2.png')"></button>

      <!-- ✅ Globe -->
      <button @click="goTo('globe')" class="icon-button" style="background-image: url('/earth.png')"></button>

      <!-- ✅ ゲーム -->
      <button @click="goTo('flower-match')" class="icon-button" style="background-image: url('/game.png')"></button>

      <!-- ✅ 時計 -->
      <button @click="goTo('time0')" class="icon-button" style="background-image: url('/clock.png')"></button>

      <!-- ✅ 天気 -->
      <button @click="goTo('weather')" class="icon-button" style="background-image: url('/weather.icon.png')"></button>

      <!-- ✅ ヒント -->
      <button @click="goToIconGuide()" class="icon-button" style="background-image: url('/icon.2.png')"></button>

      <!-- ✅ 設定 -->
      <button @click="goToSettingsFromHome()" class="icon-button" style="background-image: url('/setting.png')"></button>

      <!-- ✅ アクティビティ -->
      <button @click="goTo('activity')" class="icon-button" style="background-image: url('/activity.png')"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { onCreateMessage } from '@/graphql/subscriptions'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()
const router = useRouter()
const wallpaper = ref('')
const subscription = ref(null)

const { t } = useI18n()
const today = new Date()

const currentDay = computed(() => today.getDate())
const currentMonthName = computed(() => t(`calendar.month.${today.getMonth() + 1}`))

const wallpaperStyle = computed(() => {
  if (!wallpaper.value) return {}
  if (wallpaper.value.startsWith('color.')) {
    const colorMap = {
      'color.lightBlue': '#e6f0f9',
      'color.lightYellow': '#fff9e3',
      'color.lightPurple': '#f5f0fb'
    }
    return { backgroundColor: colorMap[wallpaper.value] || '#f5f5f5' }
  }
  return {
    backgroundImage: `url(/${wallpaper.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

function goTo(path) {
  router.push(`/${path}`)
}
function goToSettingsFromHome() {
  router.push({ path: '/settings', query: { from: 'home' } })
}
function goToIconGuide() {
  router.push({ path: '/icon-guide', query: { from: 'home' } })
}
function goToChatFromHome() {
  notificationStore.clearUnread()
  router.push({ path: '/chat-rooms', query: { from: 'home' } })
}

onMounted(async () => {
  try {
    await Auth.currentAuthenticatedUser()
  } catch {
    router.push('/signin')
    return
  }

  try {
    const user = await Auth.currentAuthenticatedUser()
    wallpaper.value = user.attributes['custom:wallpaper'] || ''
  } catch (error) {
    console.error('❌ 背景画像の取得失敗:', error)
  }

  subscription.value = API.graphql(graphqlOperation(onCreateMessage)).subscribe({
    next: ({ value }) => {
      const newMsg = value?.data?.onCreateMessage
      if (newMsg && newMsg.roomId) {
        const currentRoute = router.currentRoute.value
        const isInChatRoom = currentRoute.name === 'chat'
        const isChatRoomList = currentRoute.name === 'chat-rooms'
        const currentChatRoomId = currentRoute.params.roomId
        if ((isInChatRoom && currentChatRoomId === newMsg.roomId) || isChatRoomList) {
          return
        }
        notificationStore.setUnread(true)
      }
    },
    error: (err) => console.error('❌ メッセージサブスクリプションエラー:', err)
  })
})

onUnmounted(() => {
  if (subscription.value) {
    subscription.value.unsubscribe()
    subscription.value = null
  }
})
</script>

<style scoped>
.desktop {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  font-family: sans-serif;
  padding-top: 3rem;
  transition: background 0.5s ease-in-out, background-image 0.5s ease-in-out;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 70px);
  gap: 1rem 1.5rem;
  justify-content: center;
  margin-top: 2rem;
}

.icon-button {
  width: 70px;
  height: 70px;
  border-radius: 1rem;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #fff;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.icon-button:hover {
  transform: none;
  box-shadow: none;
}

.calendar-button {
  position: relative;
}

.calendar-date {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.7rem;
  font-weight: bold;
  color: #333;
  background: none;
  pointer-events: none;
  line-height: 1;
}

.calendar-month {
  position: absolute;
  top: 24%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: none;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
}

.notification-dot {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: #ff0000;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 14px;
  line-height: 1;
}
</style>

