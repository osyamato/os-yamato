<template>
  <Modal :visible="true" @close="emit('close')">
    <div class="mode-modal">
      <h3 class="mode-title">モードを選んでね</h3>

      <!-- スピードモード -->
      <div class="mode-section">
        <div class="section-title">スピードモード</div>
        <div class="mode-options horizontal">
          <button
            v-for="(mode, key) in speedModes"
            :key="key"
            class="mode-button"
            @click="selectSpeed(key)"
            :class="{ selected: selectedSpeed === key }"
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
        <div class="section-title">ジャンルモード</div>
        <div class="mode-options horizontal">
          <button
            v-for="(mode, key) in genreModes"
            :key="key"
            class="mode-button"
            @click="selectGenre(key)"
            :class="{ selected: selectedGenre === key }"
          >
            {{ mode.label }}
          </button>
        </div>
        <div class="mode-description">
          {{ genreModes[selectedGenre].description }}
        </div>
      </div>

      <!-- 決定ボタン -->
      <button class="confirm-button" @click="confirmSelection">このモードで遊ぶ</button>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { speedModes, genreModes } from '@/components/shiritoriModes.js'

const emit = defineEmits(['close', 'select'])

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
  background-color: #14532d;
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s ease;
}
.mode-button.selected {
  background-color: #166534;
  font-weight: bold;
  box-shadow: 0 0 0 2px #fff inset;
  transform: scale(1.05);
}
.mode-description {
  font-size: 0.95rem;
  color: #555;
}
@media (prefers-color-scheme: dark) {
  .mode-description {
    color: #aaa;
  }
}
.confirm-button {
  margin-top: 1rem;
  font-size: 1.1rem;
  background-color: #1e40af;
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.confirm-button:hover {
  background-color: #1e3a8a;
}
</style>

