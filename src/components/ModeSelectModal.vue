<template>
  <Modal :visible="true" @close="emit('close')">
    <div class="mode-modal">
      <h3 class="mode-title">モードを選んでね</h3>

      <!-- スピードモード -->
      <div class="mode-section">
        <div class="section-title">スピードモード</div>
        <div class="mode-options">
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
      </div>

      <!-- ジャンルモード -->
      <div class="mode-section">
        <div class="section-title">ジャンルモード</div>
        <div class="mode-options">
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

// ✅ emitを明示的に定義
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
}
.mode-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}
.mode-section {
  margin-bottom: 1.8rem;
}
.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.6rem;
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
  border-radius: 9999px; /* ← 丸くする */
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s ease;
}

.mode-button.selected {
  background-color: #166534;
  font-weight: bold;
  box-shadow: 0 0 0 2px #fff inset;
  transform: scale(1.05); /* 選択時の軽い拡大もOK */
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

