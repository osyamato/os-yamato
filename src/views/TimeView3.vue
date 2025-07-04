<template>
  <div class="season-container">
    <!-- 上部の時計 -->
    <div class="clock-text">{{ currentTime }}</div>

    <!-- 待機中メッセージ -->
    <div v-if="waiting" class="waiting-text">四季待機中…</div>

    <!-- 画像のフェード切り替え -->
    <transition-group name="fade" tag="div" class="image-wrapper" appear v-if="!waiting">
      <img
        v-for="(img, idx) in images"
        v-show="currentIndex === idx"
        :key="img"
        :src="img"
        class="season-image"
      />
    </transition-group>

    <!-- 雪の結晶 -->
    <div v-for="flake in snowflakes" :key="flake.id" class="snowflake" :style="flake.style">
      <img src="/snowflake6.png" class="flake-image" />
    </div>

    <!-- 雪だるま -->
    <img
      v-for="man in snowmen"
      :key="man.id"
      src="/snowman.png"
      class="snowman"
      :style="man.style"
    />
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
const waiting = ref(true)

const snowflakes = ref([])
const snowmen = ref([])

function updateClock() {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  if (waiting.value) {
    currentTime.value = `${hh}:${mm}:${ss}`
    if (ss === '00') {
      waiting.value = false
      currentTime.value = `${hh}:${mm}`
      startImageLoop()
    }
  } else {
    currentTime.value = `${hh}:${mm}`
  }
}

function startImageLoop() {
  updateSeason()
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
    updateSeason()
  }, 15000)
}

function updateSeason() {
  const isWinter = currentIndex.value === 3
  if (isWinter) {
    startSnowfall()
    startSnowmen()
  } else {
    snowflakes.value = []
    snowmen.value = []
  }
}

function startSnowfall() {
  snowflakes.value = []
  const totalFlakes = 20
  for (let i = 0; i < totalFlakes; i++) {
    const id = Date.now() + i
    const size = Math.random() * 30 + 30
    const x = Math.random() * 360
    const duration = Math.random() * 10 + 10

    snowflakes.value.push({
      id,
      style: {
        left: `${x}px`,
        animation: `fall ${duration}s linear infinite`,
        width: `${size}px`
      }
    })
  }
}

function startSnowmen() {
  snowmen.value = []

  // 1回目のみ
  const snowman1 = createSnowman()
  snowmen.value.push(snowman1)

  setTimeout(() => {
    snowmen.value = snowmen.value.filter(m => m.id !== snowman1.id)
  }, 10000)
}

function createSnowman() {
  const id = Date.now() + Math.random()
  const size = Math.random() * 20 + 30
  const x = Math.random() * 300
  const y = Math.random() * 100 + 500

  return {
    id,
    style: {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      animation: `fadeSnowman 10s ease-in-out both`
    }
  }
}

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
})
</script>

<style scoped>
.season-container {
  width: 390px;
  height: 740px;
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
  font-size: 1.4rem;
  color: #fff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
  font-family: 'Noto Serif JP', serif;
  z-index: 10;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.season-image {
  position: absolute;
  width: 390px;
  height: 740px;
  object-fit: cover;
  top: 0;
  left: 0;
  opacity: 1;
  transition: opacity 5s ease;
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

.snowflake {
  position: absolute;
  top: -40px;
  z-index: 12;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
}

.flake-image {
  display: block;
  width: 100%;
  height: auto;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  filter: none !important;
  image-rendering: pixelated !important;
  opacity: 1;
  pointer-events: none;
}

.snowman {
  position: absolute;
  z-index: 14;
}

@keyframes fall {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateY(900px);
    opacity: 0;
  }
}

@keyframes fadeSnowman {
  0%   { opacity: 0; }
  40%  { opacity: 0.6; }
  60%  { opacity: 0.6; }
  100% { opacity: 0; }
}
</style>


