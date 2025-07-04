<template>
  <div>
    <component :is="currentClock" />

    <!-- 🕰️ 時計アイコン -->
    <div class="clock-button-wrapper">
      <button @click="togglePanel" class="top-clock-button">🕰️</button>

      <!-- ▼ 時計ボタン直下に表示 -->
      <transition name="fade">
        <div v-if="panelVisible" class="switch-panel-top">
          <button @click="switchClock(0)">侘び寂び</button>
          <button disabled class="disabled-button">新しい時計 (準備中)</button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import TimeView2 from './TimeView2.vue'
import TimeView3 from './TimeView3.vue'

const clocks = [markRaw(TimeView2), markRaw(TimeView3)]
const currentIndex = ref(0)
const currentClock = ref(clocks[currentIndex.value])
const panelVisible = ref(false)

function togglePanel() {
  panelVisible.value = !panelVisible.value
}

function switchClock(index) {
  currentIndex.value = index
  currentClock.value = clocks[currentIndex.value]
  panelVisible.value = false
}
</script>

<style scoped>
.clock-button-wrapper {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 20;
}

.top-clock-button {
  font-size: 1.6rem;
  background: none;
  border: none;
  cursor: pointer;
}

.switch-panel-top {
  margin-top: 8px;
  background: rgba(100, 100, 100, 0.95); /* ← ここを灰色に */
  border: 1px solid #888;                /* 枠も少し濃いグレーに */
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.switch-panel-top button {
  margin: 0.3rem 0;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: none;
  background: #eee;
  border-radius: 6px;
  cursor: pointer;
}

.switch-panel-top button:hover:enabled {
  background: #ddd;
}

/* ▼ disabled ボタン用スタイル */
.disabled-button {
  background: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
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

