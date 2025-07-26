<template>
  <transition name="weather-transition">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-card">
        <h2 class="modal-title">都市を検索</h2>

        <!-- 🔍 入力欄 + 検索ボタン（縦並び） -->
        <div class="search-group column">
          <input
            v-model="searchQuery"
            placeholder="Tokyo, Paris, etc."
            class="search-input"
            inputmode="search"
            @keyup.enter="searchCity"
          />
          <div class="search-button-wrapper">
            <YamatoButton size="small" @click="searchCity">検索</YamatoButton>
          </div>
        </div>

        <!-- 🔽 検索結果 -->
        <ul class="result-list">
          <li
            v-for="(result, index) in results"
            :key="'result-' + index"
            @click="select(result)"
          >
            {{ result.name }}（{{ result.countryCode }}）
          </li>
        </ul>

        <!-- 📌 保存済み -->
        <h3 class="saved-title">保存済み</h3>
        <ul class="result-list">
          <li v-for="city in savedCities" :key="city.id" @click="select(city)">
            {{ city.name }}（{{ city.countryCode }}）
            <button class="delete-btn" @click.stop="deleteCity(city.id)">🗑️</button>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import {
  createWeatherCity,
  deleteWeatherCity,
  updateWeatherCity
} from '@/graphql/mutations'
import { listWeatherCities } from '@/graphql/queries'
import YamatoButton from '@/components/YamatoButton.vue'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const results = ref([])
const savedCities = ref([])

const apiKey = 'e83c02f476b6f1d5c91c072f651601b2'

const isDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true

watchEffect(() => {
  const root = document.documentElement
  root.style.setProperty('--modal-bg', isDarkMode ? '#222' : '#fff')
  root.style.setProperty('--modal-text', isDarkMode ? '#fff' : '#000')
})

function close() {
  emit('close')
}

async function searchCity() {
  const query = encodeURIComponent(searchQuery.value)
  const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}&lang=ja`)
  const data = await res.json()
  results.value = data.map(item => ({
    name: item.local_names?.ja || item.name,
    countryCode: item.country,
    lat: item.lat,
    lon: item.lon
  }))
}

async function select(city) {
  const now = new Date().toISOString()

  emit('select', city)
  close()

  searchQuery.value = ''
  results.value = []

  const existing = savedCities.value.find(
    c => c.name === city.name && c.countryCode === city.countryCode
  )

  if (existing) {
    await API.graphql(graphqlOperation(updateWeatherCity, {
      input: {
        id: existing.id,
        lastUsedAt: now
      }
    }))
  } else {
    const res = await API.graphql(graphqlOperation(createWeatherCity, {
      input: {
        ...city,
        lastUsedAt: now
      }
    }))
    city.id = res.data.createWeatherCity.id
  }

  await fetchSavedCities()
}

async function fetchSavedCities() {
  const res = await API.graphql(graphqlOperation(listWeatherCities))
  savedCities.value = res.data.listWeatherCities.items.sort(
    (a, b) => new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0)
  )
}

async function deleteCity(id) {
  await API.graphql(graphqlOperation(deleteWeatherCity, {
    input: { id }
  }))
  await fetchSavedCities()
}

onMounted(fetchSavedCities)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background-color: var(--modal-bg);
  color: var(--modal-text);
  padding: 20px;
  border-radius: 12px;
  width: 90vw;
  max-width: 360px;
  animation: dropDown 0.5s ease;
}

.modal-title {
  font-size: 20px;
  margin-bottom: 12px;
  text-align: center;
  color: var(--modal-text);
}

.saved-title {
  margin-top: 20px;
  font-size: 16px;
  border-bottom: 1px solid #aaa;
  padding-bottom: 4px;
}

/* 🔄 修正：縦並び + 中央配置 */
.search-group.column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  font-size: 16px;
  border: 1px solid #ccc;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-list li {
  padding: 6px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.result-list li:hover {
  background-color: #eee;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

/* 🌬️ アニメーション */
.weather-transition-enter-active {
  animation: dropDown 0.5s ease forwards;
}
.weather-transition-leave-active {
  animation: flyUp 0.4s ease forwards;
}

@keyframes dropDown {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes flyUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
}
</style>

