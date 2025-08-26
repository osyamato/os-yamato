<template>
  <Modal :visible="visible" @close="$emit('close')">
    <div class="modal-body">
      <h2 class="modal-title">{{ t('mission.expiredTitle') }}</h2>

      <div v-if="missions.length === 0" class="empty-message">
        ⏰ {{ t('mission.expiredEmpty') }}
      </div>

      <ul v-else class="mission-list">
        <li v-for="m in missions" :key="m.id" class="mission-item">
          <div
            class="emoji-circle"
            :style="{ backgroundColor: `hsl(${m.colorHue}, 70%, 70%)` }"
          >
            {{ m.emoji }}
          </div>
          <div class="mission-info">
            <div class="mission-title">{{ m.title }}</div>
            <div class="mission-date">
              {{ t('mission.dueDate') }}: {{ m.goalDate }}
            </div>
          </div>
          <button class="action-button" @click="confirmDelete(m.id)">⋯</button>
        </li>
      </ul>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Modal from '@/components/Modal.vue'

const { t } = useI18n()
const emit = defineEmits(['close', 'delete'])

defineProps<{
  visible: boolean
  missions: any[]
  iconColor: string
}>()

function confirmDelete(id: string) {
  if (confirm(t('mission.confirm.delete'))) {
    emit('delete', id)
  }
}
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

@media (max-width: 600px) {
  .modal-body {
    max-height: 60vh;
    font-size: 0.9rem;
    padding: 0.8rem;
  }
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
  justify-content: space-between; /* 🔧 右端にボタンを押し出す */
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
  flex-shrink: 0;
}

.mission-info {
  display: flex;
  flex-direction: column;
  flex: 1; /* 🔧 内容幅が広がりすぎないように調整 */
}

.mission-title {
  font-weight: bold;
  font-size: 1rem;
}

.mission-date {
  font-size: 0.85rem;
  color: #666;
}

.action-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #888;
  cursor: pointer;
  padding: 0 0.4rem;
  flex-shrink: 0; /* 🔧 アイコンが潰れないように */
}

.action-button:hover {
  color: #e00;
}

/* 🌙 ダークモード対応 */
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

  .action-button {
    color: #aaa;
  }

  .action-button:hover {
    color: #f66;
  }
}

</style>
