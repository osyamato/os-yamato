<template>
  <transition name="fade-modal">
    <div v-if="visible" class="terms-overlay" @click.self="close">
      <div class="terms-card">
        <h3 class="terms-title">{{ $t('terms.title') }}</h3>
        <div class="terms-body">
          {{ $t('terms.body') }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<style scoped>
.terms-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.terms-card {
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

.terms-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

.terms-body {
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-line;
}

@media (prefers-color-scheme: dark) {
  .terms-card {
    background: #1e1e1e;
    color: #f5f5f5;
  }
}

/* ✅ アニメーション定義 */
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
