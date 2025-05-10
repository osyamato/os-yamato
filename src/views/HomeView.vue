<template>
  <div
    class="desktop"
    :style="wallpaper ? { backgroundImage: `url(/${wallpaper})` } : {}"
  >
    <div class="icon-grid">
      <button @click="goTo('settings')">
        <img src="/images/setting.png" alt="設定" class="icon-image" />
      </button>
      <button @click="goTo('memo')">🗒️</button>
      <button @click="goTo('weather')">🌤</button>
      <button @click="goTo('calendar')">📅</button>
      <button @click="goTo('diary')">🌸</button>
      <button @click="goTo('contact')">👥</button>
      <button @click="goTo('chat-rooms')">💬</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'

const router = useRouter()
const wallpaper = ref('')

function goTo(path) {
  router.push(`/${path}`)  // ✅ 正しいテンプレートリテラル
}

onMounted(async () => {
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
  justify-content: flex-start; /* ← 上から表示 */
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: sans-serif;
  padding-top: 3rem; /* ← 上の余白を適度に確保 */
  transition: background-image 0.5s ease-in-out;
}


.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 70px); /* 4列 */
  gap: 1rem 1.5rem; /* ← 縦:1rem 横:1.5rem に調整 */
  justify-content: center;
}

/* 共通ボタン */
button {
  width: 70px;
  height: 70px;
  padding: 1rem;
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

/* setting画像用 */
.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style>

