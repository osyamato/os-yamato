<template>
  <div class="time-view">
    <canvas ref="threeCanvas" class="three-canvas" />
    <div class="ui-overlay">
      <div class="clock">{{ currentTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { initTimeScene } from '@/three/timeScene' // 🟢 ここで波紋も起動

const threeCanvas = ref(null)
const currentTime = new Date().toLocaleTimeString()

onMounted(() => {
  if (threeCanvas.value) {
    initTimeScene(threeCanvas.value)
  }
})
</script>

<style scoped>
.time-view {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: black;
}
.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.ui-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: white;
  font-family: monospace;
  font-size: 1.2rem;
}
</style>

