<template>
  <router-view />
</template>

<script setup>
// 特にスクリプトは不要
</script>

<style>
/* ✅ #app 全体を中央揃えに */
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ✅ body スタイルを1つに統合（ライト＋ダーク両対応） */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif;
  background-color: #fff;  /* ライトモード用 */
  color: #222;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ✅ ダークモード時 */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #ddd;
  }
}
</style>
