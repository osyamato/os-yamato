<template>
  <div>
    <input v-model="query" placeholder="都市名を検索" />
    <button @click="searchCity">検索</button>

    <ul v-if="results.length">
      <li v-for="city in results" :key="city.lat + city.lon">
        {{ formatCity(city) }}
        <button @click="selectCity(city)">⭐️</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select'])
const API_KEY = 'YOUR_OPENWEATHER_API_KEY'

const query = ref('')
const results = ref([])

function formatCity(city) {
  return `${city.name}${city.state ? ' - ' + city.state : ''} (${city.country})`
}

async function searchCity() {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query.value)}&limit=5&appid=${API_KEY}`
  const res = await fetch(url)
  results.value = await res.json()
}

function selectCity(city) {
  emit('select', {
    name: city.name,
    lat: city.lat,
    lon: city.lon,
    country: city.country,
    state: city.state || ''
  })
}
</script>
