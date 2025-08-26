<template>
  <Modal :visible="visible" @close="close">
    <transition name="modal-fade">
      <div class="modal-body" v-if="visible">
<h2 class="modal-title">{{ t('mission.new') }}</h2>

        <!-- タイトル、説明、日付 -->
<div class="centered-input">
<input
  v-model="title"
  class="modal-input"
  type="text"
  :placeholder="t('mission.placeholder.title')" 
/>
</div>

<div class="centered-input">
<textarea
  v-model="note"
  class="modal-textarea"
  :placeholder="t('mission.placeholder.note')"
/>
</div>
<div class="goal-date-container">
<div class="goal-date-label">{{ t('mission.goalDate') }}</div>
<input
  v-model="goalDate"
  class="modal-input goal-date-input"
  type="date"
  :min="todayISO"
  :max="maxDate"
/>
</div>

<div class="row-pickers">
  <!-- Emoji Picker -->
  <div class="picker-group">
    <label>{{ t('mission.emoji') }}</label>
    <select v-model="emoji">
      <option v-for="e in emojiOptions" :key="e" :value="e">{{ e }}</option>
    </select>
  </div>

  <!-- Color Picker -->
  <div class="picker-group">
    <label>{{ t('mission.color') }}</label>
    <select v-model="colorHue">
      <option v-for="(label, hue) in colorOptions" :key="hue" :value="hue">
        {{ label }}
      </option>
    </select>
  </div>

  <!-- Importance Picker -->
  <div class="picker-group">
    <label>{{ t('mission.importance') }}</label>
    <select v-model="importance">
      <option v-for="level in 5" :key="level" :value="level">
        {{ level }}{{ level === 1 ? t('mission.low') : level === 5 ? t('mission.high') : '' }}
      </option>
    </select>
  </div>
        </div>

  <div class="button-container">
<YamatoButton @click="submitMission">作成</YamatoButton>
  </div>
      </div>
    </transition>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue'

import { API, graphqlOperation, Auth } from 'aws-amplify'
import { createMission as createMissionMutation } from '@/graphql/mutations'

import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close', 'submit'])

const title = ref('')
const note = ref('')

const today = new Date()
const todayISO = today.toISOString().split('T')[0]

// 🗓️ デフォルト日付 → 1ヶ月後
const nextMonth = new Date(today)
nextMonth.setMonth(nextMonth.getMonth() + 1)
const formatted = nextMonth.toISOString().split('T')[0]
const goalDate = ref(formatted)

// 📅 最大日付 → 今日から1年後
const oneYearLater = new Date(today)
oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
const maxDate = oneYearLater.toISOString().split('T')[0]

const emoji = ref('🌱')
const colorHue = ref('200')
const importance = ref('1')

const emojiOptions = [
  '🌱', '🌷', '🌟', '📘', '📕', '✏️', '🧘‍♂️', '💪', '🍳', '🏃‍♂️', '🚴‍♀️',
  '📈', '🗓️', '🧠', '🧹', '🎵', '🎨', '💼', '🛏️'
]

const colorOptions = {
  0: t('color.red'),
  40: t('color.orange'),
  120: t('color.green'),
  200: t('color.blue'),
  280: t('color.purple')
}

function validateDateBeforeSubmit() {
  const selected = new Date(goalDate.value)
  const today = new Date()
  const max = new Date()
  max.setFullYear(max.getFullYear() + 1)

  selected.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  max.setHours(0, 0, 0, 0)

  if (selected < today) {
    alert(t('mission.error.pastDate'))
    return false
  }

  if (selected > max) {
    alert(t('mission.error.overOneYear'))
    return false
  }

  return true
}

async function submitMission() {
  if (!title.value || !goalDate.value) {
    alert(t('mission.error.requiredFields'))
    return
  }

  if (!validateDateBeforeSubmit()) {
    return
  }

  try {
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.username

    const missionData = {
      title: title.value,
      note: note.value,
      goalDate: goalDate.value,
      emoji: emoji.value,
      colorHue: parseInt(colorHue.value),
      importance: parseInt(importance.value),
      isCompleted: false
    }

    const result = await API.graphql(
      graphqlOperation(createMissionMutation, { input: missionData })
    )

    emit('submit', result.data.createMission)
    resetForm()
    close()
  } catch (error) {
    console.error('❌ ミッション作成失敗:', error)
    alert(t('mission.error.saveFailed'))
  }
}

function resetForm() {
  title.value = ''
  note.value = ''
  emoji.value = '🌱'
  colorHue.value = '200'
  importance.value = '1'
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-body {
  padding: 1.5rem;
  max-width: 90vw;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin-top: 0.1rem;     /* ← 上に余白 */
  margin-bottom: 1.5rem;  /* 下の余白も拡大して目立たせる */
}

.centered-input {
  display: flex;
  justify-content: center;
  margin-bottom: 0.8rem;
}

.modal-input,
.modal-textarea {
  width: 85%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: var(--input-bg, #f9f9f9);
  color: inherit;
}

/* スマホ用レイアウト調整 */
@media (max-width: 600px) {
  .modal-input,
  .modal-textarea {
    width: 100%;
  }
}

/* 説明欄の高さを広げる */
.modal-textarea {
  min-height: 120px;
  resize: vertical;
}

.full-width {
  width: 100%;
}

/* 達成日関連 */
.goal-date-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.goal-date-label {
  font-weight: bold;
  margin-bottom: 0.4rem;
  text-align: center;
}

.goal-date-input {
  width: 60%;
}

.row-pickers {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.picker-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

@media (prefers-color-scheme: dark) {
  .modal-body {
    --input-bg: #333;
    color: #eee;
  }
}
</style>

