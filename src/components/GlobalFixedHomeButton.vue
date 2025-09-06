
<template>
  <div
    class="home-button"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const position = ref({ x: 20, y: 20 })

// 長押し検知用
let pressTimer = null
let longPressed = false

// localStorage から位置復元
onMounted(() => {
  const saved = localStorage.getItem('homeBtnPos')
  if (saved) {
    position.value = JSON.parse(saved)
  }
})

// マウス操作
function handleMouseDown(e) {
  longPressed = false
  pressTimer = setTimeout(() => {
    longPressed = true
    startDrag(e.clientX, e.clientY)
  }, 350)

  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('mousemove', handleMouseMove)
}

function handleMouseMove(e) {
  if (isDragging.value) {
    position.value.x = e.clientX - dragOffset.value.x
    position.value.y = e.clientY - dragOffset.value.y
  }
}

function handleMouseUp(e) {
  clearTimeout(pressTimer)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousemove', handleMouseMove)

  if (isDragging.value) {
    isDragging.value = false
    localStorage.setItem('homeBtnPos', JSON.stringify(position.value))
  } else if (!longPressed) {
    // 普通のクリック時に home に戻る
    router.push('/home')
  }
}

// タッチ操作（スマホ対応）
function handleTouchStart(e) {
  longPressed = false
  const touch = e.touches[0]
  pressTimer = setTimeout(() => {
    longPressed = true
    startDrag(touch.clientX, touch.clientY)

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }, 350)

  document.addEventListener('touchend', handleTouchEnd)
}

function handleTouchMove(e) {
  if (isDragging.value) {
    const touch = e.touches[0]
    position.value.x = touch.clientX - dragOffset.value.x
    position.value.y = touch.clientY - dragOffset.value.y
  }
}

function handleTouchEnd() {
  clearTimeout(pressTimer)
  document.removeEventListener('touchend', handleTouchEnd)
  document.removeEventListener('touchmove', handleTouchMove)

  if (isDragging.value) {
    isDragging.value = false
    localStorage.setItem('homeBtnPos', JSON.stringify(position.value))
  } else if (!longPressed) {
    // タップのみで home に戻る
    router.push('/home')
  }
}

// 共通のドラッグ開始処理
function startDrag(clientX, clientY) {
  isDragging.value = true
  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }
}
</script>

<style scoped>
.home-button {
  position: fixed;
  z-index: 9999;
  width: 48px;
  height: 48px;
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.6); /* 半透明に */
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); /* 影を濃く・広げる */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  backdrop-filter: blur(4px); /* iOSやSafariで背景ぼかし */
  transition: background-color 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .home-button {
    background: rgba(68, 68, 68, 0.5); /* ダーク時も透過＋濃い色 */
    color: #eee;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  }
}

</style>

