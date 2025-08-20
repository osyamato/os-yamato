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

<div
  v-for="m in missions"
  :key="m.id"
  class="mission-marker"
  :style="getMissionStyle(m)"
@click="openMissionDetail(m)" 
>
  {{ m.emoji }}
</div>
    </div>

    <MissionCreateModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @submit="handleMissionSubmit"
    />
<MissionDetailModal
  :visible="showDetailModal"
  :mission="selectedMission"
  @close="showDetailModal = false"
/>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IconButton from '@/components/IconButton.vue'
import MissionCreateModal from '@/components/MissionCreateModal.vue'
import MissionDetailModal from '@/components/MissionDetailModal.vue'
import { API, graphqlOperation } from 'aws-amplify'
import { listMissions } from '@/graphql/queries'

const iconColor = ref('#274c77')
const showCreateModal = ref(false)
const missions = ref([])

const selectedMission = ref(null)
const showDetailModal = ref(false)

function openMissionDetail(mission) {
  selectedMission.value = mission
  showDetailModal.value = true
}

// 角度ごとのミッション数をカウント
const angleMap = new Map()

async function fetchMissions() {
  try {
    angleMap.clear() // ← 毎回リセット
    const result = await API.graphql(graphqlOperation(listMissions))
    missions.value = result.data.listMissions.items
  } catch (e) {
    console.error('❌ ミッション取得失敗', e)
  }
}

onMounted(fetchMissions)

function handleAddMission() {
  showCreateModal.value = true
}

function handleMissionSubmit() {
  fetchMissions()
}

function getMissionStyle(mission) {
  const today = new Date()
  const goal = new Date(mission.goalDate)

  // 月差分
  let monthsFromNow = monthDiff(today, goal)
  monthsFromNow = Math.max(0, Math.min(11, monthsFromNow))

  const baseAngle = monthsFromNow * 30

  // --- ランダム化 ---
  // 同じ角度に複数ある場合 → カウント用
  const key = `${monthsFromNow}`
  const count = angleMap.get(key) || 0
  angleMap.set(key, count + 1)

  // spread: ±10度, ±15px
  const spreadAngle = 10
  const spreadRadius = 15

  // ずれを計算（ミッションごとに差をつける）
  const angleOffset = (Math.random() - 0.5) * 2 * spreadAngle
  const radiusOffset = (Math.random() - 0.5) * 2 * spreadRadius

  const finalAngle = baseAngle + angleOffset
  const baseRadius = 130 + radiusOffset

  // サイズ
  const baseSize = 20 + mission.importance * 4
  const size = mission.importance === 5 ? baseSize * 1.15 : baseSize

  return {
    '--angle': `${finalAngle}deg`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: `hsl(${mission.colorHue}, 70%, 70%)`,
    fontSize: `${size * 0.6}px`,
    transform: `translate(-50%, -50%) rotate(${finalAngle}deg) translateY(-${baseRadius}px) rotate(${-finalAngle}deg)`
  }
}

function monthDiff(start: Date, end: Date) {
  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()
  const dayDiff = end.getDate() - start.getDate()

  let totalMonths = yearDiff * 12 + monthDiff
  if (dayDiff < 0) totalMonths -= 1

  return totalMonths
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
  margin-bottom: 4rem;
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

.mission-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
