<script setup>

import { onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

onMounted(() => {

  const id = route.query.id
  if (!id) return

  const appUrl = "hanaco875://gift?id=" + id
  const storeUrl = "https://apps.apple.com/app/%E8%8A%B1%E5%AD%90%E3%81%AE%E5%BA%AD/id6759095190"

  // アプリ起動
  window.location.href = appUrl

  // フォールバック（アプリ未インストール）
  setTimeout(() => {
    window.location.href = storeUrl
  }, 1200)

})

</script>

<template>

<div style="
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  height:100vh;
  text-align:center;
">

  <p style="font-size:20px; font-weight:600;">
    hanaco Garden......
  </p>


</div>

</template>
