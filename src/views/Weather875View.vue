<template>
  <div class="weather875-view" :class="{ dark: isDarkMode }">
<h2 class="title">{{ t('weather.title') }}</h2>

    <div class="icon-buttons">
      <button class="icon-button" @click="goToProfile" :style="{ backgroundColor: iconColor }">
        <span class="icon-initial" :style="{ color: iconColor === 'white' ? 'black' : 'white' }">
          {{ profile?.nickname?.charAt(0) || '👤' }}
        </span>
      </button>

<button class="icon-button" @click="checkBeforePost" :style="{ backgroundColor: iconColor }">✏️</button>
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
      <YamatoButton size="medium" class="comment-button" @click="fetchMatchingComments">
        {{ t('weather.showComments') }}
      </YamatoButton>
    </div>

    <!-- ❌ 修正: ボタン押下後かつ0件時のみ表示 -->
<p
  v-if="!isLoadingComments && hasFetched && matchedComments.length === 0"
  class="no-comments-text"
>
  {{ t('weather.noMatchedComments') }}
</p>

    <!-- ✅ 修正: コメントがあるときだけ表示 -->
    <div v-if="matchedComments.length > 0" class="comment-list-section">

      <div class="comment-list">
        <div
          v-for="(comment, index) in matchedComments"
          :key="comment.id"
          class="comment-card fade-up"
          :style="{ animationDelay: `${index * 120}ms` }"
        >
          <div class="profile-row">
            <template v-if="comment.source === 'ios'">
              <div class="text-icon">花</div>
            </template>
            <template v-else>
              <img
                class="comment-icon"
                :src="getIconUrl(comment.icon)"
                alt="icon"
              />
            </template>

<span class="comment-nickname">
  {{ comment.ownerNickname || (comment.source === 'ios' ? t('weather.fromIos') : t('weather.anonymous')) }}
</span>
          </div>

          <p class="comment-content">{{ comment.content }}</p>

          <img
            v-if="comment.imageUrl"
            class="comment-thumbnail"
            :src="comment.imageUrl"
            alt="Image"
            @click="openImageModal(comment.imageUrl)"
          />
        </div>
      </div>

      <ImageModal
        v-if="showImageModal"
        :imageUrl="modalImageUrl"
        @close="closeImageModal"
      />
    </div>

    <!-- その他のモーダル -->
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

<script setup lang="ts">
import { ref, onMounted, onActivated, computed } from 'vue'
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify'
import {
  listWeatherProfiles,
  listWeatherCities,
  listWeatherComments
} from '@/graphql/queries'
import type { WeatherComment } from '@/API'

import WeatherForecastModal from '@/components/WeatherForecastModal.vue'
import WeatherCitySelector from '@/components/WeatherCitySelector.vue'
import PostWeatherCommentModal from '@/views/PostWeatherCommentModal.vue'
import ImageModal from '@/components/ImageModal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getWeatherProfile } from '@/graphql/queries'
const matchedComments = ref<WeatherComment[]>([])
const isLoadingComments = ref(false)
const hasFetched = ref(false) 


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
const showImageModal = ref(false)
const modalImageUrl = ref('')

const API_KEY = 'e83c02f476b6f1d5c91c072f651601b2'

const iosGraphQLUrl = 'https://mu4wobom7jcazmpazk3hpxnjc4.appsync-api.ap-northeast-1.amazonaws.com/graphql'
const iosApiKey = 'da2-tuututuweneyrdykwh4vw3yfbm'



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
    const langMap = {
      ja: 'ja',
      en: 'en',
      es: 'es',
      zh: 'zh_cn'
    }
    const apiLang = langMap[locale.value] || 'en'

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.value.lat}&lon=${selectedCity.value.lon}&appid=${API_KEY}&units=metric&lang=${apiLang}`
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


async function fetchIOSPosts() {
  const query = `
    query ListPosts {
      listPosts {
        items {
          owner
          id
          content
          temperature
          weather
          timeOfDay
          language
          createdAt
        }
      }
    }
  `
  try {
    const res = await fetch(iosGraphQLUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': iosApiKey,
      },
      body: JSON.stringify({ query }),
    })

    const json = await res.json()
    return json.data?.listPosts?.items ?? []
  } catch (e) {
    console.error('❌ iOS投稿取得失敗:', e)
    return []
  }
}

// 🔍 天気のゆるい一致（単語単位、大小無視）
function looseWeatherMatch(a = '', b = '') {
  const keywordsA = a.toLowerCase().split(/\s+/)
  const keywordsB = b.toLowerCase().split(/\s+/)
  return keywordsA.some(word => keywordsB.includes(word))
}

async function fetchMatchingComments() {
  isLoadingComments.value = true

  const weather = currentWeather.value.main
  const temp = currentWeather.value.temp
  const hour = new Date().getHours()
  const lang = locale.value

  const minTemp = temp - 3
  const maxTemp = temp + 3
  const minHour = Math.floor(hour - 1.5)
  const maxHour = Math.floor(hour + 1.5)

  try {
    // ✅ Yamatoのコメント取得
    const result = await API.graphql({
      query: listWeatherComments,
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    })

    const items = result?.data?.listWeatherComments?.items || []

    const filteredYamato = await Promise.all(
      items.map(async item => {
        if (
          item.weather?.toLowerCase().includes(weather.toLowerCase()) &&
          item.language === lang &&
          item.temperature >= minTemp &&
          item.temperature <= maxTemp &&
          item.timeOfDay >= minHour &&
          item.timeOfDay <= maxHour
        ) {
          return {
            ...item,
            source: 'yamato',
            imageUrl: item.imageKey ? await Storage.get(item.imageKey) : '',
            createdAtMs: new Date(item.createdAt).getTime(),
          }
        }
        return null
      })
    )

    const filteredMain = filteredYamato.filter(Boolean) as WeatherComment[]
    const sortedMain = filteredMain.sort((a, b) => b.createdAtMs - a.createdAtMs)

    // ✅ iOS投稿取得
    const iosPosts = await fetchIOSPosts()

    const filteredIOS = iosPosts
      .filter(post =>
        looseWeatherMatch(post.weather, weather) &&
        post.language === lang &&
        post.temperature >= temp - 5 &&
        post.temperature <= temp + 5 &&
        post.timeOfDay >= Math.max(0, hour - 3) &&
        post.timeOfDay <= Math.min(23, hour + 3)
      )
      .map(post => ({
        ...post,
        source: 'ios',
        imageUrl: '',
        createdAtMs: new Date(post.createdAt).getTime(),
      }))

    // ✅ シャッフル関数
    function shuffle<T>(array: T[]): T[] {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    const randomIOS = shuffle(filteredIOS).slice(0, 5)

    // ✅ マージ
    const combined = [...sortedMain, ...randomIOS]
    matchedComments.value = combined

    // ✅ コメント取得済み & ヒットなしを検出
    hasFetched.value = sortedMain.length === 0 && randomIOS.length === 0
  } catch (err) {
    console.error('💥 fetchMatchingComments failed:', err)
    hasFetched.value = true // エラー時も表示対象とする
  } finally {
    isLoadingComments.value = false
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

function checkBeforePost() {
  const noProfile = !profile.value || !profile.value.nickname
  if (noProfile) {
    alert(t('weather.requireProfile'))
    return
  }
  openPostModal()
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

onActivated(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
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

.text-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0e0e0; /* 薄いグレー */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: #1a73e8; /* Googleブルーに近い青 */
  margin-right: 8px;
}

.comment-card.fade-up {
  opacity: 0;
  transform: translateY(-15px); /* 上から */
  animation: fadeDown 0.8s ease-out forwards;
}

@keyframes fadeDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-comments-text {
  margin-top: 1rem;
  text-align: center;
  opacity: 0;
  transform: translateY(-10px);
  animation: fadeDown 0.6s ease-out forwards;
  animation-delay: 0.2s;
  white-space: pre-line; /* ← \n を効かせる */
  color: #888; /* 任意で見やすさ向上 */
}

@keyframes fadeDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>

