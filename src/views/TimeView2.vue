<template>
  <div class="time-view">
    <div class="flower">
      <img
        v-for="(petal, index) in 5"
        :key="index"
        src="/sakura.time.png"
        class="petal"
        :class="{ faded: index < fadedCount }"
        :style="getPetalStyle(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const fadedCount = ref(0)

function getPetalStyle(index) {
  const angle = (360 / 5) * index
  return {
    transform: `rotate(${angle}deg) translate(40px) rotate(-${angle}deg)`
  }
}

onMounted(() => {
  setInterval(() => {
    fadedCount.value = (fadedCount.value + 1) % 6
  }, 1000)
})
</script>

<style scoped>
.time-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom, #cfefff, #f9fcff);
}

.flower {
  position: relative;
  width: 100px;
  height: 100px;
}

.petal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  transform-origin: center -30px;
  transition: opacity 0.5s ease;
}

.petal.faded {
  opacity: 0;
}
</style>

