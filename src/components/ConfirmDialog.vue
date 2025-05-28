<template>
  <div class="confirm-overlay" v-if="visible">
    <div class="confirm-box">
      <p class="confirm-message">{{ message }}</p>
      <div class="button-row">
        <YamatoButton type="danger" @click="confirm">削除</YamatoButton>
        <YamatoButton @click="cancel">キャンセル</YamatoButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import YamatoButton from './YamatoButton.vue'
defineProps({
  visible: Boolean,
  message: String
})
const emit = defineEmits(['confirm', 'cancel'])

function confirm() {
  emit('confirm')
}
function cancel() {
  emit('cancel')
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.confirm-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  text-align: center;
}
.confirm-message {
  margin-bottom: 1.2rem;
  font-size: 1rem;
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
