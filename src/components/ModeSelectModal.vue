<template>
  <Modal :visible="true" @close="emit('close')">
    <div class="mode-modal" :style="{ '--icon-color': iconColor, '--text-color': getTextColor(iconColor) }">
      <div class="mode-section">
        <div class="section-title">スピード選択</div>
        <div class="mode-options horizontal">
          <button
            v-for="(mode, key) in speedModes"
            :key="key"
            class="mode-button"
            :class="{ selected: selectedSpeed === key }"
            @click="selectSpeed(key)"
          >
            {{ mode.label }}
          </button>
        </div>
        <div class="mode-description">
          {{ speedModes[selectedSpeed].description }}
        </div>
      </div>

      <!-- ジャンルモード -->
      <div class="mode-section">
        <div class="section-title">ジャンル選択</div>
        <div class="mode-options horizontal">
          <button
            v-for="(mode, key) in genreModes"
            :key="key"
            class="mode-button"
            :class="{ selected: selectedGenre === key }"
            @click="selectGenre(key)"
          >
            {{ mode.label }}
          </button>
        </div>
        <div class="mode-description">
          {{ genreModes[selectedGenre].description }}
        </div>
      </div>

      <!-- 決定ボタン -->
      <button class="confirm-button" @click="confirmSelection">
        このモードで遊ぶ
      </button>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { speedModes, genreModes } from '@/components/shiritoriModes.js'

const emit = defineEmits(['close', 'select'])
const props = defineProps({
  iconColor: {
    type: String,
    default: '#14532d'
  }
})

const selectedSpeed = ref('ume')
const selectedGenre = ref('any')

function selectSpeed(key) {
  selectedSpeed.value = key
}
function selectGenre(key) {
  selectedGenre.value = key
}
function confirmSelection() {
  emit('select', {
    speed: selectedSpeed.value,
    genre: selectedGenre.value
  })
  emit('close')
}

function getTextColor(bg) {
  const darkColors = ['#274c77', '#14532d']
  return darkColors.includes(bg.toLowerCase()) ? 'white' : 'black'
}
</script>

<style scoped>
.mode-modal {
  text-align: center;
  padding: 1.5rem 1rem;
  color: #000;
}
@media (prefers-color-scheme: dark) {
  .mode-modal {
    color: #fff;
  }
}

.mode-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}
.mode-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.mode-options.horizontal {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.mode-button {
  font-size: 1rem;
  padding: 0.5rem 1.2rem;
  border-radius: 9999px;
  cursor: pointer;
  border: 2px solid var(--icon-color);
  background-color: transparent;
  color: var(--icon-color);
  transition: all 0.2s ease;
}

/* ✅ 選択中スタイル */
.mode-button.selected {
  background-color: var(--icon-color);
  color: var(--text-color);
  font-weight: bold;
  box-shadow: 0 0 0 2px #fff inset;
  transform: scale(1.05);
}

/* 説明文 */
.mode-description {
  font-size: 0.95rem;
  color: #555;
}
@media (prefers-color-scheme: dark) {
  .mode-description {
    color: #aaa;
  }
}

/* 決定ボタン */
.confirm-button {
  margin-top: 1rem;
  font-size: 1rem;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  background-color: var(--icon-color);
  color: var(--text-color);
  transition: filter 0.2s ease, transform 0.1s ease;
}
.confirm-button:hover {
  filter: brightness(1.15);
  transform: scale(1.05);
}
</style>

