<template>
  <div class="container" @click="goToHome">
    <div class="content-wrapper">
      <img
        src="/os_yamato01.png"
        alt="OS Yamato"
        class="logo animate-fade-in-soft floating"
      />
      <!-- ✅ ステータスバー -->
      <div class="status-bar">
        <div class="status-bar-fill"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

const goToHome = () => {
  router.push('/home')
}

onMounted(() => {
  setTimeout(() => {
    goToHome()
  }, 6000)
})
</script>

<style scoped>
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 100px !important;
  height: 100px !important;
  object-fit: contain;
  opacity: 0.9;
  display: block;
  max-width: none;
  max-height: none;
}

@keyframes fade-in-soft {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(10px);
  }
  100% {
    opacity: 0.9;
    transform: scale(1) translateY(0);
  }
}
.animate-fade-in-soft {
  animation: fade-in-soft 1.2s ease-out forwards;
}

@keyframes float {
  0% { transform: translateY(0); }
  25% { transform: translateY(-8px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(8px); }
  100% { transform: translateY(0); }
}
.floating {
  animation: float 3.5s ease-in-out infinite;
}

/* ✅ ステータスバー */
.status-bar {
  width: 120px;
  height: 8px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 1.5rem;
}

.status-bar-fill {
  height: 100%;
  width: 100%;
  background: linear-gradient(to right, #274c77, #a8cbe2);
  animation: loading-bar 5.5s linear forwards;
}

@keyframes loading-bar {
  from { transform: translateX(-100%); }
  to { transform: translateX(0%); }
}
</style>
