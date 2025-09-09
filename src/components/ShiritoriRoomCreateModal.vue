<template>
  <Modal :visible="visible" @close="handleClose" customClass="compact">
    <div class="room-create-modal">
      <h2 class="modal-title">🌱 ルームを作成</h2>

      <label class="modal-label">ルーム名</label>
      <input v-model="title" class="modal-input" placeholder="例：ねこ部屋" />

      <label class="modal-label">ジャンル</label>
      <select v-model="genreKey" class="modal-select">
        <option disabled value="">選択してください</option>
        <option value="any">🎲 制限なし</option>
        <option value="animal">🦁 動物</option>
        <option value="food">🍎 食べ物</option>
      </select>

      <label class="modal-label">文字数制限（省略可）</label>
      <input
        type="number"
        v-model.number="charLimit"
        class="modal-input"
        placeholder="例：3"
        min="1"
      />

<div class="modal-actions">
  <YamatoButton @click="handleCreate">作成</YamatoButton>
</div>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue' // ✅ 追加

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'create'])

const title = ref('')
const genreKey = ref('')
const charLimit = ref(null)

function handleClose() {
  emit('close')
}

function handleCreate() {
  if (!title.value || !genreKey.value) {
    alert('ルーム名とジャンルを選択してください')
    return
  }

  emit('create', {
    title: title.value,
    genreKey: genreKey.value,
    charLimit: charLimit.value || null
  })

  emit('close')
}
</script>

<style scoped>
.room-create-modal {
  padding: 1.5rem;
  text-align: center;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}

.modal-label {
  display: block;
  text-align: left;
  margin: 0.8rem 0 0.3rem;
  font-size: 0.95rem;
  color: #555;
}

.modal-select,
.modal-input {
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 1rem;
  background-color: white;  /* ✅ ライトモード白背景 */
  color: black;
}

.modal-actions {
  margin-top: 1.4rem;
}

@media (prefers-color-scheme: dark) {
  .modal-select,
  .modal-input {
    background-color: #222;   /* ✅ ダークモード背景 */
    color: white;
    border: 1px solid #666;
  }

  .modal-label {
    color: #ccc;
  }
}
</style>

