<template>
  <div class="season-container">
    <!-- 時計 -->
    <div class="clock-text">{{ currentTime }}</div>

    <!-- 待機中メッセージ -->
    <div v-if="waiting" class="waiting-text">四季待機中…</div>

    <!-- 画像 -->
    <transition-group name="fade" tag="div" class="image-wrapper" appear v-if="!waiting">
      <img
        v-for="(img, idx) in images"
        v-show="currentIndex === idx"
        :key="img"
        :src="img"
        class="season-image"
      />
    </transition-group>

    <!-- 🌸 春の桜 -->
    <div
      v-for="petal in sakuraOverlays"
      :key="petal.id"
      class="sakura-flower"
      :style="{ left: `${petal.x}px`, top: `${petal.y}px` }"
    >
      <img src="/sakura.time.png" class="sakura-img" />
    </div>

    <!-- 🍂 秋の葉 -->
    <div
      v-for="leaf in leafOverlays"
      :key="leaf.id"
      class="autumn-leaf"
      :style="{ left: `${leaf.x}px`, top: `${leaf.y}px`, animationDuration: `${leaf.duration}s` }"
    >
      <img :src="leaf.src" class="autumn-leaf-img" />
    </div>

    <!-- ❄️ 雪 -->
    <div v-for="flake in snowflakes" :key="flake.id" class="snowflake" :style="flake.style">
      <img src="/snowflake6.png" class="flake-image" />
    </div>

    <!-- ☃️ 雪だるま -->
    <transition name="fadeSnowman" mode="out-in">
      <img
        v-if="showSnowman"
        src="/snowman.png"
        class="snowman"
        :style="{ left: `${snowmanX}px`, top: `${snowmanY}px`, width: `${snowmanSize}px` }"
      />
    </transition>
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

const sakuraOverlays = ref([])
const leafOverlays = ref([])
const snowflakes = ref([])

const showSnowman = ref(false)
const snowmanX = ref(0)
const snowmanY = ref(0)
const snowmanSize = ref(40)

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
  const isSpring = currentIndex.value === 0
  const isAutumn = currentIndex.value === 2
  const isWinter = currentIndex.value === 3

  // 🌸 春
  if (isSpring) {
    startSakura()
  } else {
    sakuraOverlays.value = []
  }

  // 🍂 秋
  if (isAutumn) {
    startLeaves()
  } else {
    leafOverlays.value = []
  }

  // ❄️ 冬
  if (isWinter) {
    startSnowfall()
    startSnowman()
  } else {
    snowflakes.value = []
    showSnowman.value = false
  }
}

// 🌸 桜
function startSakura() {
  sakuraOverlays.value = []

  const interval = setInterval(() => {
    const id = Date.now() + Math.random()
    const x = Math.random() * 320 + 20
    const y = Math.random() * 600 + 50

    sakuraOverlays.value.push({ id, x, y })

    setTimeout(() => {
      sakuraOverlays.value = sakuraOverlays.value.filter(p => p.id !== id)
    }, 3000)
  }, 500)

  setTimeout(() => {
    clearInterval(interval)
  }, 15000)
}

// 🍂 秋の葉
function startLeaves() {
  leafOverlays.value = []

  const interval = setInterval(() => {
    const id = Date.now() + Math.random()
    const x = Math.random() * 350
    const y = Math.random() * 650
    const duration = Math.random() * 2 + 2.5
    const src = Math.random() < 0.5 ? '/autumn1.png' : '/autumn2.png'

    leafOverlays.value.push({ id, x, y, duration, src })

    setTimeout(() => {
      leafOverlays.value = leafOverlays.value.filter(l => l.id !== id)
    }, duration * 1000)
  }, 500)

  setTimeout(() => {
    clearInterval(interval)
  }, 15000)
}

// ❄️ 雪
function startSnowfall() {
  snowflakes.value = []

  const interval = setInterval(() => {
    const id = Date.now() + Math.random()
    const size = Math.random() * 30 + 30
    const x = Math.random() * 360
    const duration = Math.random() * 10 + 10

    snowflakes.value.push({
      id,
      style: {
        left: `${x}px`,
        animation: `fall ${duration}s linear forwards`,
        width: `${size}px`
      }
    })

    setTimeout(() => {
      snowflakes.value = snowflakes.value.filter(f => f.id !== id)
    }, duration * 1000)
  }, 500)

  setTimeout(() => {
    clearInterval(interval)
  }, 15000)
}

// ☃️ 雪だるま
function startSnowman() {
  snowmanX.value = Math.random() * 300
  snowmanY.value = Math.random() * 500 + 100
  snowmanSize.value = Math.random() * 20 + 30

  showSnowman.value = true

  setTimeout(() => {
    showSnowman.value = false
  }, 10000)
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

/* 🌸 桜 */
.sakura-flower {
  position: absolute;
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 15;
}

.sakura-img {
  width: 28px;
  height: 28px;
  animation: sakuraPop 3s ease-out forwards;
  opacity: 1;
}

@keyframes sakuraPop {
  0% { transform: scale(0.5); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* 🍂 秋の葉 */
.autumn-leaf {
  position: absolute;
  animation: leafFloat ease-out forwards;
  pointer-events: none;
  z-index: 15;
}

.autumn-leaf-img {
  width: 28px;
  height: 28px;
}

@keyframes leafFloat {
  0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
  30% { opacity: 0.8; }
  100% { transform: scale(1.4) rotate(360deg); opacity: 0; }
}

/* ❄️ 雪 */
.snowflake {
  position: absolute;
  top: -40px;
  z-index: 12;
}

.flake-image {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

@keyframes fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateY(1080px) rotate(720deg); opacity: 0; }
}

/* ☃️ 雪だるま */
.snowman {
  position: absolute;
  z-index: 14;
}

.fadeSnowman-enter-active,
.fadeSnowman-leave-active {
  transition: opacity 4s ease;
}
.fadeSnowman-enter-from,
.fadeSnowman-leave-to {
  opacity: 0;
}
.fadeSnowman-enter-to,
.fadeSnowman-leave-from {
  opacity: 0.6;
}
</style>

