<template>
<div class="desktop" :style="wallpaperStyle">
  <div class="icon-grid">
    <button @click="goTo('settings')">
      <img src="/images/setting.png" alt="設定" class="icon-image" />
    </button>

    <button @click="goTo('memo')">
      <img src="/memo.icon.png" alt="メモ" class="icon-image" />
    </button>

    <button @click="goTo('weather')">
      <img src="/weather.icon.png" alt="天気" class="icon-image" />
    </button>

    <button @click="goTo('calendar')">📅</button>

    <button @click="goTo('diary')">
      <img src="/diary.icon.png" alt="日記" class="icon-image" />
    </button>

    <button @click="goTo('contact')">
      <img src="/contact.icon.png" alt="連絡先" class="icon-image" />
    </button>

    <button @click="goTo('chat-rooms')">
      <img src="/messege.icon.png" alt="メッセージ" class="icon-image" />
    </button>

    <button @click="goTo('photo')">
      <img src="/photo.icon.png" alt="写真" class="icon-image" />
    </button>

    <!-- 🌍 新しく追加：GlobeView -->
    <button @click="goTo('globe')">
      <img src="/earth.png" alt="地球" class="icon-image" />
    </button>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'

const router = useRouter()
const wallpaper = ref('')

// 🔷 背景スタイルを切り替える computed
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

// 🔹 画面遷移
function goTo(path) {
  router.push(`/${path}`)
}

onMounted(async () => {
  try {
    // 🔒 未ログインならサインイン画面へリダイレクト
    await Auth.currentAuthenticatedUser()
  } catch {
    router.push('/signin')
    return
  }

  // ✅ 認証済み → 壁紙取得を続行
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
  background: #dcd8d4;
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
  object-fit: cover; /* ✅ 枠にぴったり収まる */
  border-radius: 16px; /* ✅ 枠の角と同じに */
}
</style>
