<template>
  <div class="clock-parent-container">
    <!-- ▼ 切り替え対象 -->
    <component :is="currentClock" />

    <!-- 🕰️ 時計アイコン（中央上） -->
    <button @click="togglePanel" class="top-clock-button">🕰️</button>

    <!-- ▼ 切り替えパネル -->
    <transition name="slide-up">
      <div v-if="panelVisible" class="switch-panel">
        <button @click="switchClock(0)">季節時計 (TimeView2)</button>
        <button @click="switchClock(1)">新しい時計 (TimeView3)</button>
      </div>
    </transition>
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
.clock-parent-container {
  position: relative; /* ⭐️ 追加：ここが大事 */
  width: 100%;
  height: 100%;
}

.top-clock-button {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 20;
}

.switch-panel {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #ddd;
  z-index: 15;
}

.switch-panel button {
  margin: 0.5rem;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  border: none;
  background: #eee;
  border-radius: 8px;
  cursor: pointer;
}

.switch-panel button:hover {
  background: #ddd;
}

/* スライドアップアニメーション */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
}
</style>

