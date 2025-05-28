<template>
  <component
    :is="tag"
    class="icon-button"
    :class="size"
    :style="{ backgroundColor: color || defaultColor, color: textColor }"
@click="$emit('click', $event)"
  >
    <slot />
  </component>
</template>

<script setup>

import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium'
  },
  tag: {
    type: String,
    default: 'button'
  }
})

defineEmits(['click'])

const defaultColor = '#274c77'

// 🔵 動的にテキストカラーを決定（背景が濃ければ白）
const textColor = computed(() => {
  const darkColors = ['#274c77', '#14532d']
  return darkColors.includes(props.color) ? 'white' : 'black'
})
</script>

<style scoped>
.icon-button {
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, box-shadow 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  font-family: inherit;
}

/* 🌿 サイズ別 */
.icon-button.small {
  width: 30px;
  height: 30px;
  font-size: 0.8rem;
}

.icon-button.medium {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
}

.icon-button.large {
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
}

.icon-button:hover {
  opacity: 0.9;
}
</style>
