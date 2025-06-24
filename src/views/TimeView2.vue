<template>
  <div class="time-container">
    <div class="time-inner">
      <!-- 🌿 枝画像 -->
      <img src="/sakura.branch.png" class="branch" />

      <!-- 🌸 花びら＋花芯 -->
      <div class="petal-wrapper">
        <template v-for="(position, groupIndex) in petalPositions" :key="groupIndex">
          <!-- 花びら -->
          <img
            v-for="i in 5"
            :key="`${groupIndex}-${i}`"
            src="/sakura.time.png"
            class="petal"
            :class="{ faded: fadedCount > groupIndex * 5 + (i - 1) }"
            :style="getPetalStyle(position.x, position.y, i)"
          />

          <!-- 花芯 -->
<img
  v-if="fadedCount >= (groupIndex + 1) * 5"
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

const fadedCount = ref(0)
const randomAngles = Array.from({ length: 12 }, () => Math.floor(Math.random() * 80 - 40))

onMounted(() => {
  setInterval(() => {
    if (fadedCount.value < 60) fadedCount.value++
  }, 1000)
})

// 🌸 花の中心座標（12輪）
const petalPositions = [
  { x: 50, y: 445 }, { x: 140, y: 488 }, { x: 200, y: 345 },
  { x: 270, y: 245 }, { x: 100, y: 370 }, { x: 340, y: 235 },
  { x: 20, y: 430 }, { x: 140, y: 350 }, { x: 250, y: 280 },
  { x: 220, y: 320 }, { x: 70, y: 395 }, { x: 300, y: 300 }
]


function getPetalStyle(cx, cy, i) {
  const angle = (360 / 5) * (i - 1)

  const radius = 0 // もう完全に中心を重ねる
  const rad = (angle * Math.PI) / 180
  const offsetX = Math.cos(rad) * radius
  const offsetY = Math.sin(rad) * radius

  return {
    left: `${cx + offsetX}px`,
    top: `${cy + offsetY}px`,
    transform: `rotate(${angle - 90}deg)`, // ← 花びら尖端を中心に向けるため-90
    transformOrigin: '63% 74%' // ← 尖端を中心に置く（必要なら55%〜65%で微調整）
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
  { dx: 9,  dy: 14, angle: 0 },  { dx: 11, dy: 10, angle: 315 },
  { dx: 9,  dy: 18, angle: 315 },  { dx: 13, dy: 14, angle: 0 },
  { dx: 9,  dy: 18, angle: 47 },  { dx: 12, dy: 11, angle: 315 },
  { dx: 10, dy: 18, angle: 44 }, { dx: 11, dy: 12, angle: 43 },
  { dx: 8,  dy: 15, angle: 315 },  { dx: 11, dy: 9, angle: 128 }
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
  background: 
    linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px),
    linear-gradient(to bottom, #cfefff, #f9fcff); /* ←元の背景 */
  background-size: 30px 30px; /* ← グリッド間隔（px）*/
  overflow: hidden;
}

.branch {
  position: absolute;
  top: 50%;
  left: 38%;
  transform: translate(-50%, -50%);
  width: 480px;
  z-index: 1;
}

.petal-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.petal {
  width: 28px;
  height: 28px;
  position: absolute;
  pointer-events: none;
  transition: opacity 0.6s ease, transform 0.6s ease;
transform-origin: 60% 110%;
}

.petal.faded {
  opacity: 0;
  transform: translateY(20px) scale(0.9) rotate(0deg); /* フェード時の回転打ち消し */
}

.flower-core {
  width: 14px;
  height: 14px;
  position: absolute;
  transform: translate(35%, 40%); /* 回転は削除 */
  z-index: 1;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.6s ease;
}


</style>




