<template>
  <Modal :visible="visible" @close="$emit('close')">
    <template v-if="mission">
      <!-- 完了ボタン（左上） -->
      <button
        class="icon-button complete-button"
        @click="handleCompleteClick"
        :style="{ backgroundColor: props.iconColor, color: '#fff' }"
      >
        🏁
      </button>

      <!-- 編集ボタン（右上） -->
      <button
        class="icon-button edit-button"
        @click="isEditing = !isEditing"
        :style="{ backgroundColor: props.iconColor, color: '#fff' }"
      >
        ✏️
      </button>

      <!-- 表示モード -->
      <div v-if="!isEditing" class="view-mode">
        <h2 class="modal-title center-text">{{ mission.emoji }} {{ mission.title }}</h2>

        <p v-if="mission.note" class="center-text">{{ mission.note }}</p>

        <div class="center-text date-block">
          <div class="goal-date-label">達成日</div>
          <div>{{ mission.goalDate }}</div>
        </div>

        <p class="center-text importance-stars">
          {{ '⭐️'.repeat(mission.importance) }}
        </p>
      </div>

      <!-- 編集モード -->
      <div v-else>
        <h2 class="modal-title">ミッション編集</h2>

        <div class="centered-input">
          <input v-model="form.title" class="modal-input" type="text" placeholder="タイトル" />
        </div>

        <div class="centered-input">
          <textarea v-model="form.note" class="modal-textarea" placeholder="説明（任意）"></textarea>
        </div>

        <div class="goal-date-container">
          <div class="goal-date-label">達成日</div>
          <input v-model="form.goalDate" class="modal-input goal-date-input" type="date" />
        </div>

        <div class="row-pickers">
          <div class="picker-group">
            <label>アイコン</label>
            <select v-model="form.emoji">
              <option v-for="e in emojiOptions" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>

          <div class="picker-group">
            <label>カラー</label>
            <select v-model="form.colorHue">
              <option v-for="(label, hue) in colorOptions" :key="hue" :value="hue">{{ label }}</option>
            </select>
          </div>

          <div class="picker-group">
            <label>重要度</label>
            <select v-model.number="form.importance">
              <option v-for="level in 5" :key="level" :value="level">
                {{ level }}{{ level === 1 ? ' (低)' : level === 5 ? ' (高)' : '' }}
              </option>
            </select>
          </div>
        </div>

        <div class="button-container">
          <YamatoButton @click="handleDelete" tone="danger">削除</YamatoButton>
          <YamatoButton @click="save">保存</YamatoButton>
          <YamatoButton @click="isEditing = false" outline>キャンセル</YamatoButton>
        </div>
      </div>
    </template>
  </Modal>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue'


const isEditing = ref(false)

const form = ref({
  emoji: '',
  title: '',
  note: '',
  goalDate: '',
  importance: 3,
  colorHue: '200'
})
function save() {
  emit('update', {
    ...props.mission,
    ...form.value,
    colorHue: parseInt(form.value.colorHue) // 必要に応じて string → number に変換
  })
  isEditing.value = false
  emit('close')
}

const props = defineProps<{
  visible: boolean
  mission: any
  iconColor: string
}>()

const emojiOptions = [
  '🌱', '🌷', '🌟', '📘', '📕', '✏️', '🧘‍♂️', '💪', '🍳', '🏃‍♂️', '🚴‍♀️',
  '📈', '🗓️', '🧠', '🧹', '🎵', '🎨', '💼', '🛏️'
]

const colorOptions = {
  0: '赤',
  40: 'オレンジ',
  120: '緑',
  200: '青',
  280: '紫'
}

watch(
  () => props.mission,
  (newMission) => {
    if (newMission) {
      form.value = {
        emoji: newMission.emoji,
        title: newMission.title,
        note: newMission.note,
        goalDate: newMission.goalDate?.substring(0, 10) || '',
        importance: newMission.importance,
        colorHue: newMission.colorHue?.toString() || '200'
      }
    }
    isEditing.value = false
  },
  { immediate: true }
)

async function handleCompleteClick() {
  if (confirm('このミッションを完了にしますか？')) {
    const today = new Date().toISOString().split('T')[0]  // "YYYY-MM-DD"

    const updated = {
      ...props.mission,
      isCompleted: true,
      goalDate: today
    }

    console.log('🔧 update input:', updated)

    emit('update', updated)
    emit('close')
  }
}

const emit = defineEmits(['close', 'update', 'delete'])

function handleDelete() {
  if (props.mission && confirm('このミッションを本当に削除しますか？')) {
    emit('delete', props.mission.id)
    emit('close')
  }
}


</script>

<style scoped>
.center-text {
  text-align: center;
  margin: 0.5rem 0;
}

.importance-stars {
  font-size: 1.5rem;
}

.date-block {
  margin-top: 1rem;
}

.goal-date-label {
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1.5rem;
}

.edit-button {
  position: absolute;
  top: 5px;
  right: 5px;
}

.complete-button {
  position: absolute;
  top: 5px;
  left: 5px;
}

/* 入力系統 */
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

.modal-textarea {
  min-height: 100px;
  resize: vertical;
}

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
  gap: 1rem;
  margin-top: 1.5rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.icon-button {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  background-color: var(--icon-bg, #274c77);
  color: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (prefers-color-scheme: dark) {
  .modal-input,
  .modal-textarea {
    --input-bg: #333;
    color: #eee;
  }
}
</style>

