
<template>
<div class="time-container" @click="spawnPetals($event)">
<div class="time-inner" :class="{ night: isNight, sunset: isSunset }">
      <!-- 🕰️ 時計 -->
      <div class="clock-box">
        <div class="icon-button" :style="{ backgroundColor: iconColor }" @click.stop="handleIconClick">🕰️</div>
        <div class="clock-text">{{ currentTime }}</div>
      </div>



      <img src="/sakura.branch.png" class="branch" :class="{ night: isNight }" />

      <!-- 🌸 秒ごとに落ちる花びら -->
      <div class="petal-wrapper" :key="loopKey">
        <template v-for="(position, groupIndex) in petalPositions" :key="groupIndex">
          <img
            v-for="i in 5"
            :key="`${groupIndex}-${i}`"
            :src="isNight ? '/sakura.time.night1.png' : '/sakura.time.png'"
            class="petal"
            :class="[
              fadedCount > groupIndex * 5 + (i - 1)
                ? ['faded', fallClasses[groupIndex * 5 + (i - 1)]]
                : ''
            ]"
            :style="getPetalStyle(position.x, position.y, i)"
          />
          <img src="/sakura.time1.png" class="flower-core" :style="getCoreStyle(position.x, position.y, groupIndex)" />
        </template>
      </div>

<!-- 🍃 葉っぱのアニメーション -->
<div
  v-for="leaf in leafOverlays"
  :key="leaf.id"
  class="leaf-float"
  :style="{ left: `${leaf.x}px`, top: `${leaf.y}px` }"
>
  <img src="/leaf.png" class="leaf-image" />
</div>

      <!-- 🌸 クリックで舞う花びら -->
      <div
        v-for="petal in petalOverlays"
        :key="petal.id"
        class="petal-float"
        :style="{ left: `${petal.x}px`, top: `${petal.y}px` }"
      >
        <img
          v-for="i in 1"
          :key="i"
          :src="isNight ? '/sakura.time.night1.png' : '/sakura.time.png'"
          class="float-petal"
          :style="{ animationDelay: `${i * 0.1}s` }"
        />
      </div>
<transition name="fade">
  <img
    v-if="birdVisible"
    :src="birdType === 'sparrow' ? '/sparrow.png' : '/owl.png'"
    :class="[
      'branch-bird',
      {
        animated: birdType === 'sparrow', // 🐦スズメだけアニメ
        'is-owl': birdType === 'owl'
      }
    ]"
  />
</transition>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'

const iconColor = ref('#888')
Auth.currentAuthenticatedUser()
  .then(user => {
    iconColor.value = user.attributes['custom:iconColor'] || '#888'
  })
  .catch(() => {})

function handleIconClick() {
  console.log('🕰️ Clock icon clicked — animation selector (future)')
}

const TOTAL_PETALS = 60
const fadedCount = ref(0)
const fallClasses = ref([])
const loopKey = ref(0)
const currentTime = ref('')
const triggeredMinute = ref('')
let fallInterval = null
const isNight = ref(false)

const isSunset = ref(false)

const showSeconds = ref(true)

function updateClock() {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  currentTime.value = showSeconds.value
    ? `${hh}:${mm}:${ss}`
    : `${hh}:${mm}`

  const hour = now.getHours()
  isNight.value = hour >= 18 || hour < 6
  isSunset.value = hour === 17  // 🌇 夕方フラグを追加

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

const petalOverlays = ref([])

function spawnPetals(event) {
  const inner = event.currentTarget.querySelector('.time-inner')
  if (!inner) return

  const rect = inner.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const id = Date.now() + Math.random()

  console.log('📍 spawnPetals', x, y)

  petalOverlays.value.push({ id, x, y })

  setTimeout(() => {
    petalOverlays.value = petalOverlays.value.filter(p => p.id !== id)
  }, 3000)
}


function getFloatStyle(p) {
  return {
    position: 'absolute',
    left: `${p.x}px`,
    top: `${p.y}px`,
    pointerEvents: 'none',
    zIndex: 5,
  }
}

const leafOverlays = ref([])

function spawnLeaves() {
  const count = Math.floor(Math.random() * 3) + 1

  for (let i = 0; i < count; i++) {
    const delay = i * 200 + Math.random() * 300

    setTimeout(() => {
      const id = Date.now() + Math.random()
const x = Math.random() * 360 + 20  // 横幅 20〜380px
const y = Math.random() * 600 + 40  // 高さ 40〜760px（やや余裕を持たせる）
      leafOverlays.value.push({ id, x, y })

      setTimeout(() => {
        leafOverlays.value = leafOverlays.value.filter(l => l.id !== id)
      }, 4000)
    }, delay)
  }
}

function startLoop() {
  if (fallInterval) clearInterval(fallInterval)

  showSeconds.value = false
  fadedCount.value = 0
  regenerateFallClasses()
  loopKey.value++

  // 🌸 再出現フェード演出
  setTimeout(() => {
    const petals = document.querySelectorAll('.petal')
    petals.forEach(el => el.classList.add('reappear'))
    setTimeout(() => {
      petals.forEach(el => el.classList.remove('reappear'))
    }, 1500)
  }, 10) // DOM更新直後に実行するため slight delay

  // 🕊️ 鳥も30秒後に表示
  setTimeout(() => {
    maybeShowBird()
  }, 30000)

  // 🌸 花びらを落とす処理
  fallInterval = setInterval(() => {
    fadedCount.value++

    if (fadedCount.value % 5 === 0 && fadedCount.value < TOTAL_PETALS) {
      if (Math.random() < 0.8) {
        spawnLeaves()
      }
    }

    if (fadedCount.value >= TOTAL_PETALS) {
      clearInterval(fallInterval)
      fallInterval = null
    }
  }, 1000)
}

const showBird = ref(false)
const birdVisible = ref(false)
const birdType = ref('') // 'sparrow' または 'owl'

function maybeShowBird() {
  const hour = new Date().getHours()
  birdType.value = (hour >= 6 && hour < 18) ? 'sparrow' : 'owl'
  birdVisible.value = true

  setTimeout(() => {
    birdVisible.value = false
  }, 8000) // 3秒後にフェードアウト
}


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
background: linear-gradient(to bottom, #87cefa, #e6f7ff, #f9fcff);
  overflow: hidden;
  transition: background 0.5s ease;
}

.time-inner.sunset {
  background: linear-gradient(to bottom, #ffd6d6, #ffece6, #fff8f4);
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

.petal.reappear {
  opacity: 1 !important;
}


.petal.faded {
  opacity: 0;
  animation-duration: 12s;
  animation-fill-mode: forwards;
}

.fall1 { animation-name: fall1; }
.fall2 { animation-name: fall2; }
.fall3 { animation-name: fall3; }
.fall4 { animation-name: fall4; }
.fall5 { animation-name: fall5; }


@keyframes fall1 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(280px, 600px) rotate(480deg); opacity: 0; }
}

@keyframes fall2 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(200px, 520px) rotate(360deg); opacity: 0; }
}

@keyframes fall3 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(340px, 580px) rotate(720deg); opacity: 0; }
}

@keyframes fall4 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(150px, 480px) rotate(300deg); opacity: 0; }
}

@keyframes fall5 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(400px, 550px) rotate(540deg); opacity: 0; }
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

.clock-box {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

.icon-button {
  font-size: 1.4rem;
  color: white;
  background-color: #888;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.clock-text {
  font-size: 2.2rem;
font-family: 'Noto Serif JP', serif;
  color: #345;
  background: none;
}

.time-inner.night .clock-text {
  color: #ddf;
  text-shadow:
    0 0 4px #aaf,
    0 0 8px #88f,
    0 0 12px #55f;
  transition: color 0.5s ease, text-shadow 1s ease;
}


.petal-float {
  position: absolute;
  pointer-events: none;
  z-index: 3;
}

.float-petal {
  width: 28px;
  height: 28px;
  position: absolute;
  animation: floatAway 2.8s ease-out forwards;
}

@keyframes floatAway {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  60% {
    transform: translate(80px, 80px) rotate(180deg);
    opacity: 0.7;
  }
  100% {
    transform: translate(120px, 160px) rotate(270deg);
    opacity: 0;
  }
}

.leaf-float {
  position: absolute;
  pointer-events: none;
  z-index: 3;
}

.leaf-image {
  width: 25px;
  height: 25px;
  position: absolute;
  animation: leafFloat 3s ease-out forwards;
  opacity: 0;
}

@keyframes leafFloat {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    transform: translate(200px, 120px) rotate(360deg);
    opacity: 0;
  }
}

.branch-bird {
  position: absolute;
  top: 330px;
  left: 180px;
  width: 38px;
  opacity: 0;
  z-index: 4;
  transition: opacity 1.2s ease;
}

/* 🦉フクロウ専用：位置を少し上に＆サイズ調整、アニメーションなし */
.branch-bird.is-owl {
  width: 60px;
  top: 310px;   /* ← ✨少し上へ（20px上げ）*/
  left: 170px;  /* ← 必要に応じて微調整可能 */
}

/* 🐦スズメのみアニメーション */
.branch-bird.animated {
  animation: birdFade 8s ease-in-out forwards;
}

@keyframes birdFade {
  0%   { opacity: 0; transform: translateY(0) scale(0.9) rotate(0deg); }
  10%  { opacity: 1; transform: translateY(-4px) scale(1) rotate(-5deg); }
  20%  { transform: translateY(0) scale(1) rotate(5deg); }
  30%  { transform: translateY(-3px) scale(1) rotate(-5deg); }
  40%  { transform: translateY(0) scale(1) rotate(0deg); }
  50%  { transform: translateY(-2px) scale(1); }
  60%  { transform: translateY(0) scale(1); }
  90%  { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(0) scale(0.95); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s ease;
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

