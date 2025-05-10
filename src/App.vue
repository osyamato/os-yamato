<template>
  <!-- ✅ アニメーション専用オーバーレイ -->
  <EffectOverlay>
    <ChatEffect />
  </EffectOverlay>

  <!-- アプリ本体 -->
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import EffectOverlay from '@/components/EffectOverlay.vue'
import ChatEffect from '@/components/ChatEffect.vue'
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif;
  background-color: #fff;
  color: #222;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center; /* 中央寄せ */
  justify-content: flex-start;
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #ddd;
  }
}
</style>

