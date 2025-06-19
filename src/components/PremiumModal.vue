<template>
  <transition name="fade-modal">
    <div v-if="visible" class="premium-overlay" @click.self="close">
      <div class="premium-card">
        <h3 class="premium-title">Yamato プレミアム</h3>
        <div class="premium-body">
          <ul class="premium-benefits">
            <li>🌸 1日最大 30枚の写真アップロード</li>
            <li>📦 長期保存と管理の優遇</li>
            <li>✨ 特別なUI演出（花・蝶など）</li>
            <li>🌍 OS Yamato の理念への支援</li>
          </ul>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import YamatoButton from '@/components/YamatoButton.vue'
const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<style scoped>
.premium-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.premium-card {
  background: #fff;
  color: #111;
  padding: 1.8rem;
  border-radius: 14px;
  width: 90%;
  max-width: 580px;
  max-height: 80vh;
  overflow-y: auto;
  animation: dropDown 0.4s ease;
}

.premium-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

.premium-body {
  font-size: 0.95rem;
  line-height: 1.6;
}

.premium-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 1.4rem;
}
.premium-benefits li {
  margin-bottom: 0.8rem;
  padding-left: 1rem;
  text-align: left;
}

.button-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

@media (prefers-color-scheme: dark) {
  .premium-card {
    background: #1e1e1e;
    color: #f5f5f5;
  }
}

.fade-modal-enter-active {
  animation: dropDown 0.4s ease-out;
}
.fade-modal-leave-active {
  animation: flyUp 0.3s ease-in;
}

@keyframes dropDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes flyUp {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-30px);
    opacity: 0;
  }
}
</style>
