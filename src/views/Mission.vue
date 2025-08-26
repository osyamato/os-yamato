<template>
  <div class="mission-page">
<h1 class="title drop-animation">{{ t('mission.title') }}</h1>

    <div class="icon-bar drop-animation">
  <IconButton :color="iconColor" @click="openExpiredModal">🥀</IconButton>
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
  {{ isYearView ? t('mission.view.year') : t('mission.view.month') }}
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
  @delete="handleCompletedMissionDelete"
/>

<ExpiredMissionsModal
  :visible="showExpiredModal"
  :missions="expiredMissions"
  :iconColor="iconColor"
  @close="showExpiredModal = false"
  @delete="handleExpiredMissionDelete"
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
import ExpiredMissionsModal from '@/components/ExpiredMissionsModal.vue' 
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
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


const expiredMissions = ref([])
const showExpiredModal = ref(false)
const fetchExpiredMissions = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const userSub = user.attributes.sub
    const today = new Date().toISOString().split('T')[0]

    const result = await API.graphql(graphqlOperation(listMissions, {
      filter: {
        isCompleted: { eq: false },         // 未完了
        owner: { contains: userSub },       // 自分のもの
        goalDate: { lt: today }             // 過去日付
      }
    }))

    expiredMissions.value = result.data.listMissions.items || []
  } catch (e) {
    console.error('❌ 期限切れミッション取得失敗:', e)
  }
}

const openExpiredModal = async () => {
  await fetchExpiredMissions()
  showExpiredModal.value = true
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

    const today = new Date()
    today.setHours(0, 0, 0, 0) // 比較用に時間部分をリセット

    missions.value = allMissions.filter(m => {
      const isIncomplete = !m.isCompleted
      const goalDate = new Date(m.goalDate)
      goalDate.setHours(0, 0, 0, 0)
      const isNotExpired = goalDate >= today
      return isIncomplete && isNotExpired
    })
  } catch (e) {
    console.error('❌ ミッション取得失敗', e)
  }
}

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
  } catch (e) {
    console.error('🎨 アイコンカラーの取得失敗:', e)
  }

  // 他の初期化処理
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchMissions()
})

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

  // ランダムオフセット生成
  const angleNoise = ((seed % 100) - 50) / 50 * 15 // ±15度のずれ

  // アイコンサイズ計算（重要度で変動）
  const baseSize = 20 + mission.importance * 4
  const size = mission.importance === 5 ? baseSize * 1.5 : baseSize

const randomness = ((seed % 80) - 40) // → -40〜+40 のズレ
const baseRadius = 120 + mission.importance * 10 + randomness

  // zIndex は重要度が低いほど前面に（＝高い数字）
  const zIndex = 10 - mission.importance // importance=1 → 9, importance=5 → 5

  if (isYearView.value) {
    const offset = getMonthOffsetFromToday(goal)
    const baseAngle = offset * 30
    const finalAngle = baseAngle + angleNoise

    return {
      '--angle': `${finalAngle}deg`,
      width: `${size}px`,
      height: `${size}px`,
      zIndex,
      backgroundColor: `hsl(${mission.colorHue}, 70%, 70%)`,
      fontSize: `${size * 0.6}px`,
      transform: `translate(-50%, -50%) rotate(${finalAngle}deg) translateY(-${baseRadius}px) rotate(${-finalAngle}deg)`
    }
  } else {
    const diff = goal.getTime() - today.getTime()
    const days = diff / (1000 * 60 * 60 * 24)
    if (days < 0 || days > 31) return { display: 'none' }

    const angle = (days / 31) * 360
    const finalAngle = angle + angleNoise

    return {
      '--angle': `${finalAngle}deg`,
      width: `${size}px`,
      height: `${size}px`,
      zIndex,
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


async function handleCompletedMissionDelete(id: string) {
  try {
    await API.graphql(graphqlOperation(deleteMissionMutation, { input: { id } }))
    completedMissions.value = completedMissions.value.filter(m => m.id !== id)
  } catch (e) {
    console.error('❌ 完了ミッション削除失敗:', e)
    alert('削除に失敗しました')
  }
}

// 親 (Mission.vue) にて追加
async function handleExpiredMissionDelete(id: string) {
  try {
    await API.graphql(graphqlOperation(deleteMissionMutation, { input: { id } }))
    expiredMissions.value = expiredMissions.value.filter(m => m.id !== id)
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
  border-bottom: 2px solid currentColor; /* 👈 アンダーラインを追加 */
  padding-bottom: 2px;
  cursor: pointer; /* 👈 タブっぽく見せる */
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
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6); /* 濃い影 */
  background-color: white; /* 背景が透明で見づらい場合用 */
}

@media (prefers-color-scheme: dark) {
  .mission-marker {
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.8),   /* 外側に白い円 */
      0 6px 14px rgba(255, 255, 255, 0.1); /* 軽い内側の影 */
    background-color: #1e1e1e; /* ダーク背景と馴染むように */
  }
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


