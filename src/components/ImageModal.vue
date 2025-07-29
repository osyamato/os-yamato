<template>
  <transition name="dropdown-flyup">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <img :src="imageUrl" alt="表示画像" class="modal-image" />
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: Boolean,
  imageUrl: String
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: auto;
  padding: 2rem;
}

.modal-content {
  background: transparent;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  animation-duration: 0.4s;
}

/* ✅ モバイル用：大きめに表示 */
@media (max-width: 768px) {
  .modal-content {
    max-width: 100vw;
    max-height: 100vh;
    padding: 0; /* 余白を完全になくす */
  }

  .modal-image {
    border-radius: 16px;
    max-width: 100vw;
    max-height: 100vh;
  }
}

/* ✅ PC用：さらに小さく・丸く */
@media (min-width: 769px) {
  .modal-content {
    max-width: 420px;
    max-height: 80vh;
  }

  .modal-image {
    border-radius: 24px;
  }
}

.modal-image {
  max-width: 100%;
  height: auto;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  object-fit: contain;
}

/* ✅ アニメーション */
.dropdown-flyup-enter-active {
  animation: dropdown-in 0.4s ease-out;
}
.dropdown-flyup-leave-active {
  animation: flyup-out 0.4s ease-in;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes flyup-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-40px);
  }
}
</style>


