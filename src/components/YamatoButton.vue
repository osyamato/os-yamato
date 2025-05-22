<template>
  <button
    :class="[
      'yamato-button',
      type,
      size,
      { 'full-width': fullWidth }
    ]"
    :style="{ backgroundColor: buttonColor, color: textColor }"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  type: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'small'
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const darkColors = ['#274c77', '#14532d']

const buttonColor = computed(() => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--yamato-button-color')
    .trim() || '#274c77'
})

const textColor = computed(() => {
  return darkColors.includes(buttonColor.value) ? 'white' : 'black'
})
</script>

<style scoped>
.yamato-button {
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* ✅ 不要なアニメーションや変形を除去 */
  transition: none !important;
  box-shadow: none !important;
  transform: none !important;

  /* ✅ z-index を確保（モーダル上でのタップ問題を防止） */
  position: relative;
  z-index: 10;
}

/* ==== Size ==== */
.yamato-button.small {
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  max-width: 100px;
  min-width: 80px;
}

.yamato-button.medium {
  font-size: 1rem;
  padding: 0.6rem 1.2rem;
}

.yamato-button.large {
  font-size: 1.2rem;
  padding: 0.8rem 1.5rem;
}

/* ==== Type ==== */
.yamato-button.default {
}

.yamato-button.danger {
  background-color: #f8d7da;
  color: #721c24;
}

/* ==== Full Width ==== */
.full-width {
  width: 100%;
}

/* ==== Disabled ==== */
.yamato-button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

/* 🚫 ホバー・アクティブ効果を完全除去 */
@media (hover: hover) {
  .yamato-button:hover,
  .yamato-button:active {
    background-color: inherit;
    box-shadow: none;
    transform: none;
  }
}
</style>

