<template>
  <Modal :visible="visible" @close="close">
    <transition name="modal-fade">
      <div class="modal-body" v-if="visible">
        <h2 class="modal-title">新しいミッション</h2>

        <!-- タイトル、説明、日付 -->
<div class="centered-input">
  <input v-model="title" class="modal-input" type="text" placeholder="タイトル" />
</div>

<div class="centered-input">
  <textarea v-model="note" class="modal-textarea" placeholder="説明（任意）"></textarea>
</div>
<div class="goal-date-container">
  <div class="goal-date-label">達成日</div>
  <input v-model="goalDate" class="modal-input goal-date-input" type="date" />
</div>

        <!-- 絵文字・カラー・重要度 -->
        <div class="row-pickers">
          <!-- Emoji Picker -->
          <div class="picker-group">
            <label>アイコン</label>
            <select v-model="emoji">
              <option v-for="e in emojiOptions" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>

<!-- Color Picker -->
<div class="picker-group">
  <label>カラー</label>
  <select v-model="colorHue">
    <option v-for="(label, hue) in colorOptions" :key="hue" :value="hue">
      {{ label }}
    </option>
  </select>
</div>

<!-- Importance Picker -->
<div class="picker-group">
  <label>重要度</label>
  <select v-model="importance">
    <option v-for="level in 5" :key="level" :value="level">
      {{ level }}
    </option>
  </select>
</div>
        </div>

  <div class="button-container">
    <YamatoButton @click="createMission">作成</YamatoButton>
  </div>
      </div>
    </transition>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'

import YamatoButton from '@/components/YamatoButton.vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close', 'submit'])

const title = ref('')
const note = ref('')
const today = new Date()
const nextMonth = new Date(today.setMonth(today.getMonth() + 1))
const formatted = nextMonth.toISOString().split('T')[0]  // YYYY-MM-DD
const goalDate = ref(formatted)
const emoji = ref('🌱')
const colorHue = ref('200')   // デフォルト 青
const importance = ref('1')   // デフォルト 1

const emojiOptions = ['🌱', '🌷', '📕', '✏️', '🍳', '🏃‍♂️']
const colorOptions = {
  0: '赤',
  40: 'オレンジ',
  120: '緑',
  200: '青',
  280: '紫'
}

function createMission() {
  if (!title.value || !goalDate.value) {
    alert('タイトルと期日は必須です')
    return
  }

  emit('submit', {
    title: title.value,
    note: note.value,
    goalDate: goalDate.value,
    emoji: emoji.value,
    colorHue: parseInt(colorHue.value),
    importance: parseInt(importance.value)
  })

  resetForm()
  close()
}

function resetForm() {
  title.value = ''
  note.value = ''
  goalDate.value = ''
  emoji.value = ''
  colorHue.value = ''
  importance.value = ''
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

