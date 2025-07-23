<template>
  <div class="weather875-view">
    <div class="header">
      <h2>花子天気</h2>
      <div class="icon-buttons">
        <button @click="openPostModal">✏️</button>
        <button @click="openSearchModal">🔍</button>
      </div>
    </div>

    <WeatherCitySelector @select="handleCitySelect" />

    <div v-if="selectedCity">
      <p>📍 {{ selectedCity.name }}</p>
      <p>☀️ 晴れ　🌡️ 25℃　🕰️ 10時</p>
      <blockquote>“空は静かに何も語らない。”</blockquote>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WeatherCitySelector from '@/components/WeatherCitySelector.vue'

const selectedCity = ref(null)

const openPostModal = () => {
  console.log('✏️ 投稿モーダルを開く（仮）')
}
const openSearchModal = () => {
  console.log('🔍 検索モーダルを開く（仮）')
}

function handleCitySelect(city) {
  selectedCity.value = city
  console.log('選ばれた都市:', city)
}
</script>

