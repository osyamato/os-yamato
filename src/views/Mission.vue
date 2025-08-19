<template>
  <div class="mission-page">
    <h1 class="title">ミッション</h1>
    <div class="year-clock">
      <div
        v-for="month in 12"
        :key="month"
        class="month-marker"
        :style="getMarkerStyle(month)"
      >
        {{ month }}
      </div>
      <div class="center-label">1年</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 円周上に12個のマークを配置
function getMarkerStyle(month: number) {
  const angle = (month / 12) * 360
  return {
    '--angle': `${angle}deg`
  }
}
</script>

<style scoped>
.mission-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
}

.year-clock {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: var(--clock-bg);
  color: var(--clock-text);
  border: 4px solid var(--clock-border);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.month-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-130px) rotate(calc(-1 * var(--angle)));
  font-weight: bold;
  font-size: 1rem;
}

.center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: inherit;
}
</style>

<style>
/* グローバル: テーマに応じたカラー定義 */
:root {
  --clock-bg: #ffffff;
  --clock-text: #222222;
  --clock-border: #dddddd;
}

@media (prefers-color-scheme: dark) {
  :root {
    --clock-bg: #111111;
    --clock-text: #ffffff;
    --clock-border: #666666;
  }
}
</style>
