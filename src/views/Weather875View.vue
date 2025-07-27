<template>
  <div class="weather875-view" :class="{ dark: isDarkMode }">
    <h2 class="title">花子天気</h2>

    <div class="icon-buttons">
      <button class="icon-button" @click="goToProfile" :style="{ backgroundColor: iconColor }">
        <span class="icon-initial" :style="{ color: iconColor === 'white' ? 'black' : 'white' }">
          {{ profile?.nickname?.charAt(0) || '👤' }}
        </span>
      </button>

      <button class="icon-button" @click="openPostModal" :style="{ backgroundColor: iconColor }">✏️</button>
      <button class="icon-button" @click="openCitySelector" :style="{ backgroundColor: iconColor }">🔍</button>
      <button class="icon-button" @click="getHourlyWeather" :style="{ backgroundColor: iconColor }">🌤️</button>
    </div>

<div v-if="selectedCity && currentWeather" class="weather-info">
  <p>📍 {{ selectedCity.name }}</p>
  <p>
    {{ weatherIcon(currentWeather.main) }}
    {{ localizedDescription }}
    🌡️ {{ currentWeather.temp }}℃
  </p>

  <!-- 🌸 コメント表示ボタン -->
  <button class="comment-button" @click="fetchMatchingComments">
    {{ t('weather.showComments') }}
  </button>
</div>

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
  :weather="currentWeather?.main || ''"
  :temperature="currentWeather?.temp || 0"
  :timeOfDay="new Date().getHours()"
  :language="locale"
  @close="showPostModal = false"
/>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listWeatherProfiles, listWeatherCities } from '@/graphql/queries'
import WeatherForecastModal from '@/components/WeatherForecastModal.vue'
import WeatherCitySelector from '@/components/WeatherCitySelector.vue'
import PostWeatherCommentModal from '@/views/PostWeatherCommentModal.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const router = useRouter()
const selectedCity = ref(null)
const currentWeather = ref(null)

const localizedDescription = computed(() => {
  const desc = currentWeather.value?.description || ''
  const key = `weatherDescription.${desc.replace(/\s+/g, '_')}`
  return t(key)
})

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
  console.log("🛰️ OpenWeather レスポンス:", currentWeather.value)
  console.log("📨 渡す main:", currentWeather.value?.main)

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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`
    console.log('📡 天気取得URL:', url)

    const res = await fetch(url)
    const data = await res.json()

    console.log('🛰️ OpenWeather レスポンス:', data)

    currentWeather.value = {
      description: data.weather[0].description,
      main: data.weather[0].main,
      temp: Math.round(data.main.temp)
    }

    console.log('✅ 現在の天気情報:', {
      city: selectedCity.value?.name,
      lat,
      lon,
      description: currentWeather.value.description,
      main: currentWeather.value.main,
      temp: currentWeather.value.temp
    })
  } catch (e) {
    console.error('❌ 天気取得失敗:', e)
  }
}

function weatherIcon(main) {
  if (main === 'Clear') return '☀️'
  if (main === 'Clouds') return '⛅'
  if (main === 'Rain') return '🌧️'
  if (main === 'Snow') return '❄️'
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

const matchedComments = ref([])

async function fetchMatchingComments() {
  if (!currentWeather.value) return

  try {
    const res = await API.graphql(graphqlOperation(listWeatherComments, {
      filter: {
        weather: { eq: currentWeather.value.main },
        language: { eq: locale.value }
      }
    }))

    let items = res.data.listWeatherComments.items

    for (const item of items) {
      if (item.imageKey) {
        try {
          item.imageUrl = await Storage.get(item.imageKey)
        } catch {
          console.warn('📷 画像取得失敗:', item.imageKey)
        }
      }
    }

    matchedComments.value = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    console.log('✅ コメント取得:', matchedComments.value)
  } catch (e) {
    console.error('❌ コメント取得失敗:', e)
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

.comment-button {
  margin-top: 12px;
  background-color: #274c77;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.comment-button:hover {
  background-color: #1f3a5a;
}

</style>

