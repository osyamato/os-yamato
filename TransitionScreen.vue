<template>
  <div
    class="flex items-center justify-center h-screen bg-black text-white relative"
    @click="goToHome"
  >
    <!-- ロゴ画像 -->
    <img
      src="/os_yamato01.png" 
      alt="OS Yamato"
      class="w-48 h-48 object-contain animate-fade-in"
    />

    <!-- タップ指示 -->
    <p class="absolute bottom-10 text-gray-400 animate-pulse">
      タップして開始
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push('/home')
}
</script>

<style scoped>
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 1.2s ease-out forwards;
}
</style>
