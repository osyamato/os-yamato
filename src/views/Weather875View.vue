<template>
  <div class="weather875-view" :style="{ backgroundColor: '#111', color: 'white', textAlign: 'center', padding: '20px' }">
    <!-- 🌸 タイトル -->
    <h2 style="font-size: 28px; margin-bottom: 20px;">花子天気</h2>

    <!-- 🎯 アイコンボタンたち -->
    <div class="icon-buttons" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
      <button class="icon-button" @click="openPostModal">✏️</button>
      <button class="icon-button" @click="openCitySelector">🔍</button>
      <button class="icon-button" @click="getHourlyWeather">🌤️</button>
    </div>

    <!-- 📍 選択された都市の天気情報 -->
    <div v-if="selectedCity && currentWeather" style="margin-top: 20px;">
      <p>📍 {{ selectedCity.name }}</p>
      <p>{{ weatherIcon(currentWeather.description) }} {{ currentWeather.description }}　🌡️ {{ currentWeather.temp }}℃</p>
      <blockquote>“空は静かに何も語らない。”</blockquote>
    </div>

    <!-- ⏳ 3時間ごとの天気モーダル -->
    <WeatherForecastModal
      :visible="showForecastModal"
      :forecastList="forecastList"
      @close="showForecastModal = false"
    />

    <!-- 🔍 都市選択モーダル -->
    <WeatherCitySelector
      :visible="showCitySelector"
      @close="showCitySelector = false"
      @select="handleCitySelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { listWeatherCities } from '@/graphql/queries'
import WeatherForecastModal from '@/components/WeatherForecastModal.vue'
import WeatherCitySelector from '@/components/WeatherCitySelector.vue'

const selectedCity = ref(null)
const currentWeather = ref(null)
const iconColor = ref('#274c77')

const showForecastModal = ref(false)
const forecastList = ref([])
const showCitySelector = ref(false)

const API_KEY = 'e83c02f476b6f1d5c91c072f651601b2'

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'

  try {
    const res = await API.graphql(graphqlOperation(listWeatherCities))
    const cities = res.data.listWeatherCities.items

    // ⏰ lastUsedAt で並べ替え
    const sorted = cities
      .filter(c => c.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))

    if (sorted.length > 0) {
      selectedCity.value = sorted[0]
      await fetchCurrentWeather(sorted[0].lat, sorted[0].lon)
    }
  } catch (e) {
    console.error('❌ 初期ロード失敗:', e)
  }
})

function openPostModal() {
  console.log('✏️ 投稿モーダル（仮）')
}

function openCitySelector() {
  showCitySelector.value = true
}

function handleCitySelected(city) {
  selectedCity.value = city
  fetchCurrentWeather(city.lat, city.lon)
}

async function fetchCurrentWeather(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`
    const res = await fetch(url)
    const data = await res.json()
    currentWeather.value = {
      description: data.weather[0].description,
      temp: Math.round(data.main.temp)
    }
  } catch (e) {
    console.error('❌ 天気取得失敗:', e)
  }
}

function weatherIcon(desc) {
  if (desc.includes('晴')) return '☀️'
  if (desc.includes('曇')) return '⛅'
  if (desc.includes('雨')) return '🌧️'
  if (desc.includes('雪')) return '❄️'
  return '🌤️'
}

function getHourlyWeather() {
  console.log('🌤️ 3時間ごとの天気取得')
  showForecastModal.value = true
  forecastList.value = [
    { time: '12時', weather: '☀️ 晴れ', temp: 26 },
    { time: '15時', weather: '⛅ 曇り', temp: 24 },
    { time: '18時', weather: '🌧️ 雨', temp: 22 }
  ]
}
</script>

<style scoped>
.weather875-view {
  animation: dropDown 0.6s ease-out;
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
</style>

