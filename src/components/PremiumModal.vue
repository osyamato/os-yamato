<template>
  <transition name="fade-modal">
    <div v-if="visible" class="premium-overlay" @click.self="close">
      <div class="premium-card">
        <h3 class="premium-title">{{ $t('account.subscription') }}</h3>
        <div class="premium-body">
          <p>{{ $t('account.premiumPreparing') }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
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
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  animation: dropDown 0.4s ease;
  text-align: center;
}

.premium-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.premium-body {
  font-size: 1rem;
  line-height: 1.6;
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


