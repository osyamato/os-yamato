<script setup>

import { onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

onMounted(() => {

  const id = route.query.id

  if (id) {
    window.location.href = "hanaco875://gift?id=" + id
  }

})

</script>

<template>

<div style="display:flex;align-items:center;justify-content:center;height:100vh;">
  <p>アプリを開いています…</p>
</div>

</template>
