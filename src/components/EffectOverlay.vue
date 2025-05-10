<template>
  <div class="effect-overlay">
    <ChatEffect /> <!-- ✅ チャットエフェクトをここに表示 -->
  </div>
</template>

<script setup>
import ChatEffect from './ChatEffect.vue'  // ✅ 相対パスで読み込み
</script>

<style scoped>
.effect-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999; /* 他のUIより最前面 */
  overflow: hidden;
}
</style>

