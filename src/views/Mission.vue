<template>
  <div class="mission-page">
    <h1 class="title drop-animation">ミッション</h1>

    <div class="icon-bar drop-animation">
      <IconButton :color="iconColor" @click="handleAddMission">＋</IconButton>
      <IconButton :color="iconColor">🌷</IconButton>
      <IconButton :color="iconColor">⏳</IconButton>
    </div>

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

    <!-- ミッション作成モーダル -->
    <MissionCreateModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @submit="handleMissionSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconButton from '@/components/IconButton.vue'
import MissionCreateModal from '@/components/MissionCreateModal.vue'

const iconColor = ref('#274c77')
const showCreateModal = ref(false)

function handleAddMission() {
  showCreateModal.value = true
}

function handleMissionSubmit(data) {
  console.log('✅ ミッション作成データ:', data)
  // ここで保存処理などを追加予定
}

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
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #000;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .title {
    color: #fff;
  }
}
.icon-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 4rem; /* ← 追加：時計との距離をとる */
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

.drop-animation {
  animation: dropIn 0.5s ease-out;
}

@keyframes dropIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

</style>

<style>
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

