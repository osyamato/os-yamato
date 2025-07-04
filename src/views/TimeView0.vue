<template>
  <div>
    <component :is="currentClock" />

    <!-- 🕰️ 時計アイコン -->
    <div class="clock-button-wrapper">
      <button @click="togglePanel" class="top-clock-button">🕰️</button>

      <!-- ▼ 時計ボタン直下に表示 -->
      <transition name="fade">
        <div v-if="panelVisible" class="switch-panel-top">
          <button @click="switchClock(0)">季節時計 (TimeView2)</button>
          <button @click="switchClock(1)">新しい時計 (TimeView3)</button>
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
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

.switch-panel-top button:hover {
  background: #ddd;
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


