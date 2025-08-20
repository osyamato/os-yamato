<template>
  <Modal :visible="visible" @close="$emit('close')">
    <div class="modal-body" v-if="mission">
      <h2 class="modal-title">{{ mission.emoji }} {{ mission.title }}</h2>
      <p><strong>説明:</strong> {{ mission.note || 'なし' }}</p>
      <p><strong>達成日:</strong> {{ mission.goalDate }}</p>
      <p><strong>重要度:</strong> ⭐️{{ mission.importance }}</p>
    </div>
  </Modal>
</template>

<script setup lang="ts">

import Modal from '@/components/Modal.vue'

defineProps<{
  visible: boolean
  mission: any
}>()

defineEmits(['close'])
</script>

<style scoped>
.modal-body {
  padding: 1.5rem;
  max-width: 90vw;
  font-size: 1rem;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>
