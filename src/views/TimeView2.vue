<template>
  <div class="time-container">
    <div class="time-inner" :class="{ night: isNight }">
      <div class="clock">{{ currentTime }}</div>

      <!-- 木枝表示 -->
      <img src="/sakura.branch.png" class="branch" :class="{ night: isNight }" />

      <!-- 花びら群 -->
      <div class="petal-wrapper" :key="loopKey">
        <template v-for="(position, groupIndex) in petalPositions" :key="groupIndex">
<img
            v-for="i in 5"
            :key="`${groupIndex}-${i}`"
            :src="isNight ? '/sakura.time.night1.png' : '/sakura.time.png'"
            class="petal"
            :class="[
              fadedCount > groupIndex * 5 + (i - 1) ? ['faded', fallClasses[groupIndex * 5 + (i - 1)]] : ''
            ]"
            :style="getPetalStyle(position.x, position.y, i)"
          />
          <img
            src="/sakura.time1.png"
            class="flower-core"
            :style="getCoreStyle(position.x, position.y, groupIndex)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const TOTAL_PETALS = 60
const fadedCount = ref(0)
const fallClasses = ref([])
const loopKey = ref(0)
const currentTime = ref('')
const triggeredMinute = ref('')
let fallInterval = null
const isNight = ref(false)

function updateClock() {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hh}:${mm}:${ss}`

  const hour = now.getHours()
  isNight.value = hour >= 18 || hour < 6

  const minuteKey = `${hh}:${mm}`
  if (ss === '00' && triggeredMinute.value !== minuteKey) {
    triggeredMinute.value = minuteKey
    startLoop()
  }
}

function regenerateFallClasses() {
  fallClasses.value = Array.from({ length: TOTAL_PETALS }, () => {
    const n = Math.floor(Math.random() * 5) + 1
    return `fall${n}`
  })
}

function startLoop() {
  if (fallInterval) {
    clearInterval(fallInterval)
    fallInterval = null
  }

  fadedCount.value = 0
  regenerateFallClasses()
  loopKey.value++
  fadedCount.value++

  fallInterval = setInterval(() => {
    fadedCount.value++
    if (fadedCount.value >= TOTAL_PETALS) {
      clearInterval(fallInterval)
      fallInterval = null
    }
  }, 1000)
}

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
})

const petalPositions = [
  { x: 50, y: 445 }, { x: 140, y: 488 }, { x: 200, y: 345 },
  { x: 270, y: 245 }, { x: 100, y: 370 }, { x: 340, y: 235 },
  { x: 20, y: 430 }, { x: 140, y: 350 }, { x: 250, y: 280 },
  { x: 220, y: 320 }, { x: 70, y: 395 }, { x: 300, y: 300 }
]

function getPetalStyle(cx, cy, i) {
  const angle = (360 / 5) * (i - 1)
  return {
    left: `${cx}px`,
    top: `${cy}px`,
    transform: `rotate(${angle - 90}deg)`,
    transformOrigin: '68% 76%',
  }
}

function getCoreStyle(x, y, index) {
  const { dx, dy, angle } = coreConfigs[index]
  return {
    left: `${x + dx}px`,
    top: `${y + dy}px`,
    transform: `rotate(${angle}deg)`
  }
}

const coreConfigs = [
  { dx: 9, dy: 13, angle: 42 },  { dx: 12, dy: 10, angle: 135 },
  { dx: 9,  dy: 17, angle: 0 },  { dx: 11, dy: 10, angle: 315 },
  { dx: 9,  dy: 22, angle: 0 },  { dx: 13, dy: 20, angle: 0 },
  { dx: 9,  dy: 22, angle: 47 }, { dx: 12, dy: 18, angle: 0 },
  { dx: 10, dy: 18, angle: 44 }, { dx: 11, dy: 12, angle: 43 },
  { dx: 8,  dy: 18, angle: 10 }, { dx: 11, dy: 9,  angle: 140 }
]
</script>

<style scoped>
.time-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.time-inner {
  position: relative;
  width: 390px;
  height: 844px;
  background: linear-gradient(to bottom, #cfefff, #f9fcff);
  overflow: hidden;
  transition: background 0.5s ease;
}

.time-inner.night {
  background: linear-gradient(to bottom, #0a0f1f, #1c1f2e, #0a0f1f);
}

.time-inner.night::before {
  content: "";
  position: absolute;
  top: 20%;
  left: 60%;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(255, 255, 200, 0.12), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  animation: moonGlow 6s ease-in-out infinite;
}

@keyframes moonGlow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.12;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.18;
  }
}

.branch {
  position: absolute;
  top: 50%;
  left: 38%;
  transform: translate(-50%, -50%);
  width: 480px;
  z-index: 0;
  transition: filter 0.3s ease;
}

.branch.night {
  filter: brightness(0.25) hue-rotate(-40deg) saturate(1.2) contrast(1.1);
}

.petal-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.petal {
  width: 28px;
  height: 28px;
  position: absolute;
  pointer-events: none;
  z-index: 1;
  transform-origin: 60% 110%;
  opacity: 1;
  transition: opacity 0.6s ease;
}


.petal.faded {
  opacity: 0;
  animation-duration: 5s;
  animation-fill-mode: forwards;
}

.fall1 { animation-name: fall1; }
.fall2 { animation-name: fall2; }
.fall3 { animation-name: fall3; }
.fall4 { animation-name: fall4; }
.fall5 { animation-name: fall5; }

@keyframes fall1 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate(20px, 500px) rotate(160deg); opacity: 0; }
}
@keyframes fall2 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate(-30px, 480px) rotate(-240deg); opacity: 0; }
}
@keyframes fall3 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate(15px, 550px) rotate(200deg); opacity: 0; }
}
@keyframes fall4 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate(-20px, 530px) rotate(220deg); opacity: 0; }
}
@keyframes fall5 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate(10px, 580px) rotate(-180deg); opacity: 0; }
}

.flower-core {
  width: 14px;
  height: 14px;
  position: absolute;
  transform: translate(35%, 40%);
  z-index: 0;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.6s ease;
}

.clock {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2.2rem;
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.8);
  color: #222;
  padding: 6px 14px;
  border-radius: 12px;
  z-index: 10;
}
</style>


