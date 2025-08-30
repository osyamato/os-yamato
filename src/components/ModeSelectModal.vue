<template>
  <transition name="mode-fade">
    <div v-if="visible" class="mode-modal-overlay" @click.self="$emit('close')">
      <div class="mode-modal-card">
        <h3 class="mode-title">モードを選んでね</h3>
        <div class="mode-options">
          <button class="mode-button" @click="$emit('select', '松')">🌲 松</button>
          <button class="mode-button" @click="$emit('select', '竹')">🎋 竹</button>
          <button class="mode-button" @click="$emit('select', '梅')">🌸 梅</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: Boolean
})
defineEmits(['select', 'close'])
</script>

<style scoped>
.mode-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.mode-modal-card {
  background: #fff;
  color: #000;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  .mode-modal-card {
    background: #222;
    color: #fff;
  }
}

.mode-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
}

.mode-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.mode-button {
  font-size: 1.1rem;
  padding: 0.6rem 1.2rem;
  background-color: #14532d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.mode-button:hover {
  background-color: #166534;
}

/* アニメーション */
.mode-fade-enter-active {
  animation: dropDown 0.4s ease forwards;
}
.mode-fade-leave-active {
  animation: flyUp 0.3s ease forwards;
}

@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
</style>
