<template>
  <Modal :visible="visible" @close="$emit('close')">
    <div class="modal-body">
      <h2 class="modal-title">期限切れミッション</h2>

      <div v-if="missions.length === 0" class="empty-message">
        ⏰ 期限切れのミッションはありません。
      </div>

      <ul v-else class="mission-list">
        <li v-for="m in missions" :key="m.id" class="mission-item">
          <div class="emoji-circle" :style="{ backgroundColor: `hsl(${m.colorHue}, 70%, 70%)` }">
            {{ m.emoji }}
          </div>
          <div class="mission-info">
            <div class="mission-title">{{ m.title }}</div>
            <div class="mission-date">期日: {{ m.goalDate }}</div>
          </div>
        </li>
      </ul>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal.vue'

defineProps<{
  visible: boolean
  missions: any[]
  iconColor: string
}>()

defineEmits(['close'])
</script>

<style scoped>
.modal-body {
  padding: 1rem;
  max-width: 85vw;
  max-height: 70vh;
  overflow-y: auto;
  background-color: var(--modal-bg, #fff);
  border-radius: 12px;
  color: inherit;
}

.modal-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}

.empty-message {
  text-align: center;
  color: #888;
  margin-top: 2rem;
}

.mission-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mission-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.emoji-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.mission-info {
  display: flex;
  flex-direction: column;
}

.mission-title {
  font-weight: bold;
  font-size: 1rem;
}

.mission-date {
  font-size: 0.85rem;
  color: #666;
}

@media (prefers-color-scheme: dark) {
  .modal-body {
    --modal-bg: #1e1e1e;
    color: #f0f0f0;
  }
  .mission-item {
    border-bottom: 1px solid #444;
  }
  .mission-date {
    color: #aaa;
  }
}
</style>
