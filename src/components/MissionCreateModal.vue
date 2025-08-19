<template>
  <Modal :visible="visible" @close="close">
    <transition name="modal-fade">
      <div class="modal-body" v-if="visible">
        <h2 class="modal-title">新しいミッション</h2>

        <!-- タイトル、説明、日付 -->
        <input v-model="title" class="modal-input" type="text" placeholder="タイトル" />
        <textarea v-model="note" class="modal-textarea" placeholder="説明（任意）"></textarea>
        <input v-model="goalDate" class="modal-input" type="date" />

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

        <button class="modal-button" @click="createMission">作成</button>
      </div>
    </transition>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close', 'submit'])

const title = ref('')
const note = ref('')
const goalDate = ref('')
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
  margin-bottom: 1rem;
  text-align: center;
}

.modal-input,
.modal-textarea,
select {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: var(--input-bg, #f9f9f9);
  color: inherit;
}

.modal-textarea {
  min-height: 80px;
  resize: vertical;
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

.modal-button {
  width: 100%;
  padding: 0.7rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  background-color: #274c77;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal-button:hover {
  background-color: #1f3c5d;
}

@media (prefers-color-scheme: dark) {
  .modal-body {
    --input-bg: #333;
    color: #eee;
  }
}
</style>
