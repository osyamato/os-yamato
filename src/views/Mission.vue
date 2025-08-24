<template>
  <div class="mission-page">
    <h1 class="title drop-animation">ミッション</h1>

    <div class="icon-bar drop-animation">
      <IconButton :color="iconColor" @click="handleAddMission">＋</IconButton>
<IconButton :color="iconColor" @click="openCompletedModal">🏁</IconButton>
    </div>

    <div class="year-clock">
      <!-- 0〜11月を固定で表示 -->
<div
  v-for="i in (isYearView ? 12 : 31)"
  :key="'marker-' + i + '-' + isYearView"
  class="month-marker fade-item"
  :style="getMarkerStyle(i - 1, isYearView ? 12 : 31)"
>
  {{ i - 1 }}
</div>

<div class="center-label" @click="toggleViewMode">
  {{ isYearView ? '1年' : '1ヶ月' }}
</div>
      <!-- ミッション -->
<div
  v-for="m in missions"
  :key="m.id + '-' + isYearView"
  class="mission-marker fade-item"
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
  :iconColor="iconColor"
  @close="showDetailModal = false"
  @update="handleMissionUpdate"
  @delete="handleMissionDelete"
/>


<CompletedMissionsModal
  :visible="showCompletedModal"
  :missions="completedMissions"
  :iconColor="iconColor"
  @close="showCompletedModal = false"
/>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import IconButton from '@/components/IconButton.vue'
import MissionCreateModal from '@/components/MissionCreateModal.vue'
import MissionDetailModal from '@/components/MissionDetailModal.vue'
import { API, graphqlOperation } from 'aws-amplify'
import { listMissions } from '@/graphql/queries'
import { updateMission as updateMissionMutation } from '@/graphql/mutations'
import { deleteMission as deleteMissionMutation } from '@/graphql/mutations'
import CompletedMissionsModal from '@/components/CompletedMissionsModal.vue'
import { Auth } from 'aws-amplify'


const iconColor = ref('#274c77')
const showCreateModal = ref(false)
const missions = ref([])
const selectedMission = ref(null)
const showDetailModal = ref(false)

const isYearView = ref(true)
const completedMissions = ref([])
const showCompletedModal = ref(false)
const fetchCompletedMissions = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const userSub = user.attributes.sub

    const result = await API.graphql(graphqlOperation(listMissions, {
      filter: {
        isCompleted: { eq: true },
        owner: { contains: userSub }
      }
    }))

    completedMissions.value = result.data.listMissions.items || []
  } catch (e) {
    console.error('✅ 完了ミッション取得失敗:', e)
  }
}

const openCompletedModal = async () => {
  await fetchCompletedMissions()
  showCompletedModal.value = true
}

function toggleViewMode() {
  isYearView.value = !isYearView.value
}

function openMissionDetail(mission) {
  selectedMission.value = mission
  showDetailModal.value = true
}

async function fetchMissions() {
  try {
    const result = await API.graphql(graphqlOperation(listMissions))
    const allMissions = result.data.listMissions.items

    // 👇 完了していないミッションだけを表示する
    missions.value = allMissions.filter(m => !m.isCompleted)
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

function getMonthOffsetFromToday(goal: Date): number {
  const today = new Date()
  const goalDate = new Date(goal)

  const yearDiff = goalDate.getFullYear() - today.getFullYear()
  const monthDiff = goalDate.getMonth() - today.getMonth()

  const offset = yearDiff * 12 + monthDiff

  if (offset === 0) return 0

  return Math.max(0, Math.min(offset, 11))
}

function getMissionStyle(mission) {
  const goal = new Date(mission.goalDate)
  const today = new Date()

  const seed = hashCode(mission.id)
  const radiusOffset = ((seed % 300) - 150) / 150 * 15

  const baseRadius = 130 + radiusOffset
  const baseSize = 20 + mission.importance * 4
const size = mission.importance === 5 ? baseSize * 1.5 : baseSize

  if (isYearView.value) {
    const offset = getMonthOffsetFromToday(goal)
    const baseAngle = offset * 30

    const rawAngle = seed % 100
    const angleOffset = offset === 0
      ? (rawAngle / 100) * 10
      : ((rawAngle - 50) / 50) * 10

    const finalAngle = baseAngle + angleOffset

    return {
      '--angle': `${finalAngle}deg`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: `hsl(${mission.colorHue}, 70%, 70%)`,
      fontSize: `${size * 0.6}px`,
      transform: `translate(-50%, -50%) rotate(${finalAngle}deg) translateY(-${baseRadius}px) rotate(${-finalAngle}deg)`
    }
  } else {
    // === 1ヶ月ビュー ===
    const diff = goal.getTime() - today.getTime()
    const days = diff / (1000 * 60 * 60 * 24)
    if (days < 0 || days > 31) return { display: 'none' }

    const angle = (days / 31) * 360
    const finalAngle = angle

    return {
      '--angle': `${finalAngle}deg`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: `hsl(${mission.colorHue}, 70%, 70%)`,
      fontSize: `${size * 0.6}px`,
      transform: `translate(-50%, -50%) rotate(${finalAngle}deg) translateY(-${baseRadius}px) rotate(${-finalAngle}deg)`
    }
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getMarkerStyle(index: number, division: number) {
  const angle = (index / division) * 360 - 0  // ← 12時方向を 0 にする！
  return {
    '--angle': `${angle}deg`
  }
}

async function handleMissionUpdate(updatedMission) {
  try {
    const input = {
      id: updatedMission.id,
      title: updatedMission.title,
      note: updatedMission.note,
      goalDate: updatedMission.goalDate,
      emoji: updatedMission.emoji,
      importance: updatedMission.importance,
      colorHue: updatedMission.colorHue,
      isCompleted: updatedMission.isCompleted // ← これが重要！
    }

    await API.graphql(graphqlOperation(updateMissionMutation, { input }))

    const index = missions.value.findIndex(m => m.id === updatedMission.id)
    if (index !== -1) {
      if (input.isCompleted) {
        missions.value.splice(index, 1) // 完了済みは削除
      } else {
        missions.value[index] = { ...missions.value[index], ...input }
      }
    }
  } catch (e) {
    console.error('❌ 更新失敗:', e)
    alert('保存に失敗しました')
  }
}

async function handleMissionDelete(id: string) {
  try {
    await API.graphql(graphqlOperation(deleteMissionMutation, { input: { id } }))
    missions.value = missions.value.filter(m => m.id !== id)
  } catch (e) {
    console.error('❌ 削除失敗:', e)
    alert('削除に失敗しました')
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
  border: 6px solid var(--clock-border);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.4),   /* メインの濃く大きな影 */
    0 6px 18px rgba(0, 0, 0, 0.3),    /* 中間のやわらかい影 */
    0 0 60px rgba(0, 0, 0, 0.2); 
}
@media (prefers-color-scheme: dark) {
  .year-clock {
    box-shadow:
      0 12px 28px rgba(255, 255, 255, 0.08),
      0 6px 18px rgba(255, 255, 255, 0.05),
      0 0 60px rgba(255, 255, 255, 0.04);
  }
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
  --clock-border: #bbbbbb; /* 少し濃くして枠線が目立つように */
}

@media (prefers-color-scheme: dark) {
  :root {
    --clock-bg: #111111;
    --clock-text: #ffffff;
    --clock-border: #666666;
  }
}

.fade-item {
  opacity: 0;
  animation: fadeIn 1.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

</style>


