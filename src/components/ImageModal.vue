<template>
  <transition name="fade">
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  max-width: 80vw;
  max-height: 80vh;
  background: transparent;
  padding: 1rem;
  box-sizing: border-box;
}

.modal-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  object-fit: contain;
}
</style>


