<template>
  <div class="season-container">
    <!-- 上部中央の時計（常に表示） -->
    <div class="clock-text">{{ currentTime }}</div>

    <!-- ▼ 画像のフェード切り替え -->
    <transition-group name="fade" tag="div" class="image-wrapper" v-if="isAnimating">
      <img
        v-for="(img, index) in images"
        v-show="currentIndex === index"
        :key="img"
        :src="img"
        class="season-image"
      />
    </transition-group>

    <!-- 中央メッセージ -->
    <div v-if="!isAnimating" class="waiting-text">四季待機中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const images = [
  '/spring.time.jpg',
  '/summer.time.jpg',
  '/autumn.time.jpg',
  '/winter.time.jpg'
]

const currentIndex = ref(0)
const currentTime = ref('')
const isAnimating = ref(false)
let intervalId

function updateClock() {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  // 秒は使わず、上部には HH:MM を表示
  currentTime.value = `${hh}:${mm}`

  // 秒が00ならアニメーション開始
  if (ss === '00' && !isAnimating.value) {
    startAnimation()
  }
}

function startAnimation() {
  isAnimating.value = true

  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
  }, 15000)
}

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
})
</script>

<style scoped>
.season-container {
  width: 390px;
  height: 844px;
  position: relative;
  overflow: hidden;
}

.clock-text {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2.2rem;
  font-family: 'Noto Serif JP', serif;
  color: #fff;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.7);
  z-index: 10;
}

.waiting-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  color: #fff;
  font-family: 'Noto Serif JP', serif;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.7);
  z-index: 5;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.season-image {
  position: absolute;
  width: 390px;
  height: 844px;
  object-fit: cover;
  top: 0;
  left: 0;
  opacity: 1;
  transition: opacity 2s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>

