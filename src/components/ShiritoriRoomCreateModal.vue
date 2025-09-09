<template>
  <Modal :visible="visible" @close="handleClose" customClass="compact">
    <div class="room-create-modal">
      <h2 class="modal-title">🌱 ルームを作成</h2>

      <label class="modal-label">ルーム名</label>
      <input
        v-model="title"
        class="modal-input"
        placeholder="例：ねこ部屋"
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
import YamatoButton from '@/components/YamatoButton.vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'create'])

const title = ref('')

function handleClose() {
  emit('close')
}

function handleCreate() {
  if (!title.value.trim()) {
    alert('ルーム名を入力してください')
    return
  }

  emit('create', {
    title: title.value.trim()
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

.modal-input {
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 1rem;
  background-color: white;
  color: black;
}

.modal-actions {
  margin-top: 1.4rem;
}

@media (prefers-color-scheme: dark) {
  .modal-input {
    background-color: #222;
    color: white;
    border: 1px solid #666;
  }

  .modal-label {
    color: #ccc;
  }
}
</style>
