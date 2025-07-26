<template>
  <div class="weather875-view" :class="{ dark: isDarkMode }">
    <!-- 🌸 タイトル -->
    <h2 class="title">花子天気</h2>

    <!-- 🎯 アイコンボタンたち -->
    <div class="icon-buttons">
      <!-- 👤 プロフィール -->
      <button class="icon-button" @click="goToProfile" :style="{ backgroundColor: iconColor }">
        <span class="icon-initial" :style="{ color: iconColor === 'white' ? 'black' : 'white' }">
          {{ profile?.nickname?.charAt(0) || '👤' }}
        </span>
      </button>

      <!-- ✏️ 投稿 -->
      <button class="icon-button" @click="openPostModal" :style="{ backgroundColor: iconColor }">✏️</button>

      <!-- 🔍 都市検索 -->
      <button class="icon-button" @click="openCitySelector" :style="{ backgroundColor: iconColor }">🔍</button>

      <!-- 🌤️ 3時間天気 -->
      <button class="icon-button" @click="getHourlyWeather" :style="{ backgroundColor: iconColor }">🌤️</button>
    </div>

    <!-- 📍 選択された都市の天気 -->
    <div v-if="selectedCity && currentWeather" class="weather-info">
      <p>📍 {{ selectedCity.name }}</p>
      <p>
        {{ weatherIcon(currentWeather.description) }}
        {{ currentWeather.description }}
        🌡️ {{ currentWeather.temp }}℃
      </p>
      <blockquote>“空は静かに何も語らない。”</blockquote>
    </div>

    <!-- 🌦️ モーダルたち -->
    <WeatherForecastModal
      :visible="showForecastModal"
      :forecastList="forecastList"
      @close="showForecastModal = false"
    />
    <WeatherCitySelector
      :visible="showCitySelector"
      @close="showCitySelector = false"
      @select="handleCitySelected"
    />
    <PostWeatherCommentModal
      :visible="showPostModal"
      :weather="currentWeather?.description || ''"
      :temperature="currentWeather?.temp || 0"
      :timeOfDay="new Date().getHours()"
      language="ja"
      @close="showPostModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listWeatherProfiles, listWeatherCities } from '@/graphql/queries'
import WeatherForecastModal from '@/components/WeatherForecastModal.vue'
import WeatherCitySelector from '@/components/WeatherCitySelector.vue'
import PostWeatherCommentModal from '@/views/PostWeatherCommentModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedCity = ref(null)
const currentWeather = ref(null)
const forecastList = ref([])
const showForecastModal = ref(false)
const showCitySelector = ref(false)
const showPostModal = ref(false)
const iconColor = ref('#274c77')
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
const profile = ref(null)

const API_KEY = 'e83c02f476b6f1d5c91c072f651601b2'

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })

  const user = await Auth.currentAuthenticatedUser()
  const sub = user.attributes.sub
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'

  try {
    const res = await API.graphql(graphqlOperation(listWeatherProfiles, {
      filter: { sub: { eq: sub } }
    }))
    const items = res.data.listWeatherProfiles.items
    if (items.length > 0) {
      profile.value = items[0]
    } else {
      console.log('⚠️ プロフィール未作成')
    }
  } catch (e) {
    console.error('❌ プロフィール取得エラー:', e)
  }

  try {
    const res = await API.graphql(graphqlOperation(listWeatherCities))
    const cities = res.data.listWeatherCities.items
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
  showPostModal.value = true
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

function goToProfile() {
  router.push('/weather-profile')
}

async function getHourlyWeather() {
  if (!selectedCity.value) return

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.value.lat}&lon=${selectedCity.value.lon}&appid=${API_KEY}&units=metric&lang=ja`
    const res = await fetch(url)
    const data = await res.json()

    const now = Date.now()
    const nextForecasts = data.list
      .filter(item => new Date(item.dt * 1000).getTime() > now)
      .map(item => {
        const dateObj = new Date(item.dt * 1000)
        const date = dateObj.toISOString().split('T')[0]
        const time = dateObj.getHours() + '時'
        const weather = weatherIcon(item.weather[0].description) + ' ' + item.weather[0].description
        const temp = Math.round(item.main.temp)
        return { date, time, weather, temp }
      })

    forecastList.value = nextForecasts
    showForecastModal.value = true
  } catch (e) {
    console.error('❌ 3時間天気取得失敗:', e)
  }
}
</script>

<style scoped>
.weather875-view {
  padding: 20px;
  text-align: center;
  animation: dropDown 0.6s ease-out;
  background-color: white;
  color: black;
}
.weather875-view.dark {
  background-color: #111;
  color: white;
}

.title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: inherit;
}

.icon-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.icon-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  font-size: 22px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.icon-initial {
  font-size: 18px;
  font-weight: bold;
}

.weather-info {
  margin-top: 20px;
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

