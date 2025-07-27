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
<YamatoButton size="medium" @click="fetchMatchingComments">
{{ t('weather.showComments') }}
</YamatoButton>
</div>

<div v-if="matchedComments.length > 0" class="comment-list-section">
  <h4 class="matched-comments-title">{{ t('weather.matchedCommentsTitle') }}</h4>

<div class="comment-list">
  <div
    v-for="comment in matchedComments"
    :key="comment.id"
    class="comment-card"
  >
    <!-- 👤 プロフィール（アイコン + ニックネーム） -->
    <div class="profile-row">
      <img
        class="comment-icon"
        :src="getIconUrl(comment.icon)"
        alt="icon"
      />
      <span class="comment-nickname">
        {{ comment.ownerNickname || 'Anonymous' }}
      </span>
    </div>

    <!-- 📝 本文 -->
    <p class="comment-content">{{ comment.content }}</p>

    <!-- 📷 サムネイル -->
    <img
      v-if="comment.imageUrl"
      class="comment-thumbnail"
      :src="comment.imageUrl"
      alt="Image"
      @click="openImageModal(comment.imageUrl)"
    />

    <!-- 🌤️ メタ情報 -->
    <p class="comment-meta">
      {{ comment.weather }} / {{ comment.temperature }}°C /
      {{ formatHour(comment.timeOfDay) }}時 / {{ getLangName(comment.language) }}
    </p>
  </div>
</div>

  <!-- 画像モーダル -->
  <ImageModal
    v-if="showImageModal"
    :imageUrl="modalImageUrl"
    @close="closeImageModal"
  />
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
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify'
import {
  listWeatherProfiles,
  listWeatherCities,
  listWeatherComments
} from '@/graphql/queries'
import WeatherForecastModal from '@/components/WeatherForecastModal.vue'
import WeatherCitySelector from '@/components/WeatherCitySelector.vue'
import PostWeatherCommentModal from '@/views/PostWeatherCommentModal.vue'
import ImageModal from '@/components/ImageModal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getWeatherProfile } from '@/graphql/queries'


const { t, locale } = useI18n()
const router = useRouter()

const selectedCity = ref(null)
const currentWeather = ref(null)
const forecastList = ref([])
const showForecastModal = ref(false)
const showCitySelector = ref(false)
const showPostModal = ref(false)
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
const iconColor = ref('#274c77')
const profile = ref(null)
const matchedComments = ref([])
const showImageModal = ref(false)
const modalImageUrl = ref('')

const API_KEY = 'e83c02f476b6f1d5c91c072f651601b2'

const localizedDescription = computed(() => {
  const desc = currentWeather.value?.description || ''
  const key = `weatherDescription.${desc.replace(/\s+/g, '_')}`
  return t(key)
})

const iconFilenames = [
  'weather.icon1.png', 'weather.icon2.png', 'weather.icon3.png',
  'weather.icon4.png', 'weather.icon5.png', 'weather.icon6.png',
  'weather.icon7.png', 'weather.icon8.png', 'weather.icon9.png', 'weather.icon10.png'
]


onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const user = await Auth.currentAuthenticatedUser()
  const sub = user.attributes.sub
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'

try {
  const user = await Auth.currentAuthenticatedUser()
  const sub = user.attributes.sub
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'

  const res = await API.graphql(graphqlOperation(getWeatherProfile, { id: sub }))
  profile.value = res.data.getWeatherProfile
  if (!profile.value) {
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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`
    const res = await fetch(url)
    const data = await res.json()
    currentWeather.value = {
      description: data.weather[0].description,
      main: data.weather[0].main,
      temp: Math.round(data.main.temp)
    }
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
if (item.thumbnailKey) {
  try {
    item.imageUrl = await Storage.get(item.thumbnailKey)
  } catch {
    console.warn('📷 サムネイル取得失敗:', item.thumbnailKey)
  }
}
    }
    matchedComments.value = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    console.log('✅ コメント取得:', matchedComments.value)
  } catch (e) {
    console.error('❌ コメント取得失敗:', e)
  }
}

function openImageModal(url) {
  modalImageUrl.value = url
  showImageModal.value = true
}

function getIconUrl(fileName) {
  return fileName && iconFilenames.includes(fileName)
    ? `/${fileName}`  // ← パスを変更
    : '/weather.icon1.png'
}

function closeImageModal() {
  showImageModal.value = false
  modalImageUrl.value = ''
}

function formatHour(hour) {
  if (typeof hour !== 'number') return hour
  return `${hour}時`
}
function getLangName(code) {
  if (code === 'ja') return '日本語'
  if (code === 'en') return 'English'
  if (code === 'zh') return '中文'
  if (code === 'es') return 'Español'
  return code
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

/* 🌸 コメントセクション */
.comment-list {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.comment-card {
  position: relative;
  width: 330px;
  padding: 0.6rem 0.8rem;
  background: white;
  border-bottom: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #000;
  word-wrap: break-word;
  box-sizing: border-box;
  overflow: hidden;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.weather875-view.dark .comment-card {
  background: #2c2c2c;
  color: #f5f5f5;
  border-bottom: 1px solid #555;
}

/* 👤 プロフィール行 */
.profile-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.comment-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-nickname {
  font-weight: bold;
  font-size: 0.95rem;
}

/* 📝 コメント本文 */
.comment-content {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 6px;
}

/* 🌤️ メタ情報 */
.comment-meta {
  font-size: 0.75rem;
  color: gray;
  margin-top: 8px;
}

/* 📷 サムネイル */
.comment-thumbnail {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin: 8px auto 0;
  display: block;
}

/* ⋯ 削除アイコン */
.more-icon {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
}
.more-icon:hover {
  opacity: 1;
}

/* Yamatoボタン */
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

/* アニメーション */
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

