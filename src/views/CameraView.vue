<template>
  <div class="camera-page">
    <h2>カメラ</h2>
    <video ref="video" autoplay playsinline></video>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
const video = ref(null)

onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    video.value.srcObject = stream
  } catch (err) {
    alert("カメラの起動に失敗しました: " + err)
  }
})
</script>

<style scoped>
.camera-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}
video {
  width: 90%;
  max-width: 500px;
  border: 2px solid #ccc;
  border-radius: 10px;
}
</style>
