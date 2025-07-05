<template>
  <div class="desktop" :style="wallpaperStyle">
    <div class="icon-grid">
      <!-- ✅ カレンダー -->
      <button @click="goTo('calendar')" class="calendar-button">
        <img src="/calendar.png" alt="カレンダー" class="icon-image" />
        <span class="calendar-date">{{ currentDay }}</span>
        <span class="calendar-month">{{ currentMonthName }}</span>
      </button>

      <!-- ✅ メモ -->
      <button @click="goTo('memo')">
        <img src="/memo.icon.png" alt="メモ" class="icon-image" />
      </button>

      <!-- ✅ 連絡先 -->
      <button @click="goTo('contact')">
        <img src="/contact.icon.png" alt="連絡先" class="icon-image" />
      </button>

      <!-- ✅ 日記 -->
      <button @click="goTo('diary')">
        <img src="/diary.icon.png" alt="日記" class="icon-image" />
      </button>

      <!-- ✅ 写真 -->
      <button @click="goTo('photo')">
        <img src="/photo.icon.png" alt="写真" class="icon-image" />
      </button>

      <!-- ✅ 動画 -->
      <button @click="goTo('video')">
        <img src="/video.png" alt="動画一覧" class="icon-image" />
      </button>

      <!-- ✅ メッセージ -->
      <button @click="goToChatFromHome" class="chat-button">
        <img src="/messege.icon.png" alt="メッセージ" class="icon-image" />
<span v-if="hasUnread" class="notification-dot">🌱</span>
      </button>

      <!-- ✅ 風の便り -->
      <button @click="goTo('wind-inbox')">
        <img src="/WindMessage2.png" alt="風の便り" class="icon-image" />
      </button>

      <!-- ✅ Globe -->
      <button @click="goTo('globe')">
        <img src="/earth.png" alt="地球" class="icon-image" />
      </button>

      <!-- ✅ ゲーム -->
      <button @click="goTo('flower-match')">
        <img src="/game.png" alt="花あわせゲーム" class="icon-image" />
      </button>

      <!-- ✅ 時計 -->
      <button @click="goTo('time0')">
        <img src="/clock.png" alt="時計" class="icon-image" />
      </button>

      <!-- ✅ 天気 -->
      <button @click="goTo('weather')">
        <img src="/weather.icon.png" alt="天気" class="icon-image" />
      </button>

      <!-- ✅ ヒント -->
      <button @click="goToIconGuide">
        <img src="/icon.2.png" alt="ヒント" class="icon-image" />
      </button>

      <!-- 🎛 設定 -->
      <button @click="goToSettingsFromHome">
        <img src="/images/setting.png" alt="設定" class="icon-image" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { onCreateMessage } from '@/graphql/subscriptions'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const wallpaper = ref('')
const hasUnread = ref(false)
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
  hasUnread.value = false // ✅ 開いたときに消す
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

  // ✅ 新着メッセージ検知サブスク
  subscription.value = API.graphql(graphqlOperation(onCreateMessage)).subscribe({
    next: ({ value }) => {
      const newMsg = value?.data?.onCreateMessage
      if (newMsg && newMsg.roomId) {
        hasUnread.value = true
      }
    },
    error: (err) => console.error('❌ メッセージサブスクリプションエラー:', err)
  })
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

button {
  width: 70px;
  height: 70px;
  padding: 0;
  font-size: 2rem;
  border-radius: 1rem;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  will-change: opacity, transform;
  transition: opacity 0.2s ease-in-out;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  width: 20px; /* ✅ 固定幅 */
  height: 20px; /* ✅ 固定高さ */
  background-color: #ff0000; /* 濃い赤 */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white; /* 🌱の色 */
  font-size: 14px;
  line-height: 1;
}
</style>
