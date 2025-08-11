<template>
  <transition name="weather-transition">
    <div v-if="visible" class="forecast-modal" @click.self="close">
      <div class="forecast-card">
        <h3 class="forecast-title">🌤️ {{ t('weather.forecastTitle') }}</h3>

        <!-- 今日 -->
        <div v-if="todayList.length" class="section">
          <div class="section-title">{{ t('weather.today') }}</div>
          <div class="forecast-list">
            <div
              v-for="(item, index) in todayList"
              :key="'today-' + index"
              class="forecast-row"
            >
              <span class="forecast-time">{{ formatHour(item.time) }}</span>
              <span class="forecast-weather">{{ item.weather }}</span>
              <span class="forecast-temp">{{ item.temp }}℃</span>
            </div>
          </div>
        </div>

        <!-- 明日以降 -->
        <div v-if="laterList.length" class="section">
          <div class="section-title">{{ t('weather.later') }}</div>
          <div class="forecast-list">
            <div
              v-for="(item, index) in laterList"
              :key="'later-' + index"
              class="forecast-row"
            >
              <span class="forecast-date">{{ formatDate(item.date) }}</span>
              <span class="forecast-weather">{{ item.weather }}</span>
              <span class="forecast-temp">{{ item.min }}℃ / {{ item.max }}℃</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  visible: Boolean,
  forecastList: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

function formatHour(time) {
  const h = parseInt(String(time).replace(/\D/g, ''), 10)

  if (locale.value.startsWith('en')) return `${h} o'clock`
  if (locale.value.startsWith('es')) return `${h} h`
  if (locale.value.startsWith('zh')) return `${h}点`
  return `${h}時`
}

function parseHour(timeStr) {
  if (!timeStr) return 0
  return parseInt(String(timeStr).replace(/\D/g, ''), 10) || 0
}

function getLocalDateStr(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayList = computed(() => {
  const now = new Date()
  const todayStr = getLocalDateStr(now)
  const currentHour = now.getHours()

  return props.forecastList?.filter(item => {
    return (
      item?.date === todayStr &&
      parseHour(item?.time) >= currentHour &&
      typeof item?.temp === 'number'
    )
  }) || []
})

const laterList = computed(() => {
  const todayStr = getLocalDateStr()
  const grouped = {}

  props.forecastList?.forEach(item => {
    if (!item || !item.date || typeof item.temp !== 'number' || !item.weather) return
    if (item.date > todayStr) {
      if (!grouped[item.date]) grouped[item.date] = { temps: [], weather: [] }
      grouped[item.date].temps.push(item.temp)
      grouped[item.date].weather.push(item.weather)
    }
  })

  return Object.entries(grouped).map(([date, data]) => {
    const min = data.temps.length ? Math.min(...data.temps) : 0
    const max = data.temps.length ? Math.max(...data.temps) : 0
    const mostFrequent = getMostFrequent(data.weather)
    return { date, min, max, weather: mostFrequent }
  })
})

function getMostFrequent(array) {
  const counts = {}
  array.forEach(item => {
    counts[item] = (counts[item] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}
</script>


<style scoped>
.forecast-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.forecast-card {
  border-radius: 20px;
  padding: 30px;
  width: 92vw;
  max-width: 460px;
  animation: dropDown 0.5s ease;
  transition: background-color 0.3s, color 0.3s;
  background: #fff;
  color: #000;
}

/* ダークモード切り替え */
@media (prefers-color-scheme: dark) {
  .forecast-card {
    background: #222;
    color: #fff;
  }
}

.forecast-title {
  font-size: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.section {
  margin-top: 24px;
}
.section-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  border-bottom: 1px solid #aaa;
  padding-bottom: 4px;
}
.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.forecast-row {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
}
.forecast-time,
.forecast-date,
.forecast-weather,
.forecast-temp {
  white-space: nowrap;
}

/* アニメーション */
.weather-transition-enter-active {
  animation: dropDown 0.5s ease forwards;
}
.weather-transition-leave-active {
  animation: flyUp 0.4s ease forwards;
}
@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
</style>

