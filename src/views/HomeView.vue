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
      <button @click="goToChatFromHome">
        <img src="/messege.icon.png" alt="メッセージ" class="icon-image" />
      </button>

      <!-- ✅ 風のたより -->
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
      <button @click="goTo('time2')">
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

      <!-- 🎛 設定 (最後に) -->
      <button @click="goToSettingsFromHome">
        <img src="/images/setting.png" alt="設定" class="icon-image" />
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n' // ✅ ローカライズ

const router = useRouter()
const wallpaper = ref('')

const { t } = useI18n()
const today = new Date()

// 📅 月と日（動的に変化）
const currentDay = computed(() => today.getDate())
const currentMonthName = computed(() => t(`calendar.month.${today.getMonth() + 1}`))

// 🔷 背景スタイルの切り替え
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

// 🔹 共通ページ遷移
function goTo(path) {
  router.push(`/${path}`)
}

// ✅ 設定・チャットにだけクエリ付与
function goToSettingsFromHome() {
  router.push({ path: '/settings', query: { from: 'home' } })
}

function goToChatFromHome() {
  router.push({ path: '/chat-rooms', query: { from: 'home' } })
}

function goToIconGuide() {
  router.push({ path: '/icon-guide', query: { from: 'home' } })
}

// 🔐 認証確認と背景取得
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
  background: #fff; /* ← ここを白に */
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;

  /* 追加 👇 */
  will-change: opacity, transform;
  transition: opacity 0.2s ease-in-out;
}

.calendar-button {
  position: relative;
}

/* 📅 日付の数字 */
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

/* 📅 月（日本語 or 英語） */
.calendar-month {
  position: absolute;
  top: 24%; /* 🔽 赤帯部分想定 */
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: none;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.4); /* 読みやすく */
}

</style>
