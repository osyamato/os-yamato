<template>
  <transition name="modal">
    <div v-if="visible" class="modal-background" @click="handleBackgroundClick">
      <div class="modal-inner-card" :class="customClass" @click.stop>
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  visible: Boolean,
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'refresh'])

function handleBackgroundClick() {
  emit('close')
  emit('refresh')
}
</script>

<style scoped>
.modal-background {
  position: fixed;
  top: 0;
  left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 1000;
}

/* ✅ 基本モーダル */
.modal-inner-card {
  background: #fff;
  color: #111;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
}

/* 🎯 背景なし（カレンダー検索など） */
.modal-inner-card.naked {
  background: transparent;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
  width: auto;
  max-width: none;
  max-height: none;
}

/* 🎯 コンパクト（チャットプロフィールなど） */
.modal-inner-card.compact {
  padding: 1.2rem 1.5rem;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: #fff;
  color: #111;
}

/* 🌙 ダークモード */
@media (prefers-color-scheme: dark) {
  .modal-inner-card:not(.naked) {
    background: #1f1f1f;
    color: #f5f5f5;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
  }

  .modal-inner-card.compact {
    background: #1f1f1f !important;
    color: #f5f5f5 !important;
  }

  textarea,
  input {
    background: #2e2e2e !important;
    color: #fff !important;
    border-color: #444 !important;
  }

  input::placeholder,
  textarea::placeholder {
    color: #aaa !important;
  }
}

/* ✨ アニメーション */
.modal-enter-active {
  animation: dropDown 0.4s ease-out;
}
.modal-leave-active {
  animation: flyUp 0.3s ease-in;
}

@keyframes dropDown {
  0% { transform: translateY(-30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-30px); opacity: 0; }
}
</style>
