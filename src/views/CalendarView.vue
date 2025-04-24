<template>
  <div class="calendar-container" :class="animationDirection">
    <h2 class="month-title">
      <button @click="prevMonth">&lt;</button>
      {{ currentMonth + 1 }}月
      <button @click="nextMonth">&gt;</button>
    </h2>

    <table class="calendar-grid">
      <thead>
        <tr>
          <th v-for="(day, index) in localizedDaysOfWeek" :key="index">
            <div class="day-circle">{{ day }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, index) in calendar" :key="index">
<td
  v-for="(date, i) in week"
  :key="i"
  :class="{
    'today': !isNaN(date?.getTime?.()) && isToday(date)
  }"
  :style="getEventCellStyle(date)"
  @click="openModal(date)"
>
            <span v-if="!isNaN(date?.getTime?.())" class="date-number">
              {{ date.getDate() }}
            </span>

            <!-- ✅ 祝日名（付箋スタイル） -->
            <div
              v-if="getHolidayNameSafe(date)"
              class="holiday-sticky"
            >
              {{ getHolidayNameSafe(date).length > 6 ? getHolidayNameSafe(date).slice(0, 6) + '…' : getHolidayNameSafe(date) }}
            </div>

            <!-- イベント（付箋スタイル） -->
<div
  v-for="(event, idx) in getEvents(date)"
  :key="idx"
  class="event-sticky"
  :style="{ marginTop: idx === 0 ? '18px' : '2px' }"
>
  {{ event.title.length > 6 ? event.title.slice(0, 6) + '…' : event.title }}
</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="event-footer">
      <div
        class="event-sticky"
        v-for="(event, idx) in filteredEvents"
        :key="idx"
        @click="openFromFooter(event)"
      >
        {{ new Date(event.date).getDate() }}日：{{ event.title }}
      </div>
    </div>
<transition name="modal">
  <div class="modal" v-if="selectedDate">
    <div class="modal-content">
      <h3>{{ selectedDate.toLocaleDateString() }}</h3>

      <!-- ⭐ 祝日があれば表示 -->
      <p v-if="getHolidayNameSafe(selectedDate)" class="holiday-tag">
        🇯🇵 {{ getHolidayNameSafe(selectedDate) }}
      </p>

      <!-- ⭐ 複数予定の表示 -->
      <transition name="fade-height" mode="out-in">
        <div key="modal-inner" class="modal-inner">
          <div v-if="selectedEvents.length">
            <div
              class="event-card"
              v-for="(event, index) in selectedEvents"
              :key="event.id || index"
            >
              <p><strong>{{ event.title }}</strong></p>
              <p>{{ event.startTime }} - {{ event.endTime }}</p>
              <p class="memo-text">{{ event.memo }}</p>
              <div class="button-container">
                <button class="btn-active" @click="editEvent(event)">編集</button>
                <button class="btn-disabled" @click="deleteEvent(event.id)">削除</button>
              </div>
            </div>
            <hr />
          </div>

          <!-- 新規 or 編集フォーム -->
          <div>
            <input v-model="title" placeholder="予定タイトル" />
            <input type="time" v-model="startTime" />
            <input type="time" v-model="endTime" />
            <input v-model="memo" placeholder="メモ" />

            <div class="button-container">
              <button
                :class="isFormFilled ? 'btn-active' : 'btn-disabled'"
                :disabled="!isFormFilled"
                @click="editingEventId ? updateSchedule() : createSchedule()"
              >
                {{ editingEventId ? '更新' : '追加' }}
              </button>
            </div>
          </div>

          <div class="button-container">
            <button class="btn-disabled" @click="selectedDate = null">閉じる</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</transition>


  </div>
</template>




<script setup>
const holidaysJP = ref({})

onMounted(async () => {
  const res = await fetch('https://holidays-jp.github.io/api/v1/date.json')
  holidaysJP.value = await res.json()
})


import { ref, computed, onMounted, watch } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { listSchedules } from '@/graphql/queries'
import {
  createSchedule as createScheduleMutation,
  deleteSchedule as deleteScheduleMutation,
  updateSchedule as updateScheduleMutation
} from '@/graphql/mutations'
import * as Holidays from 'japanese-holidays'

const today = new Date()
const selectedDate = ref(null)
const selectedEvent = ref(null)
const schedules = ref([])
const title = ref('')
const startTime = ref('12:00')
const endTime = ref('13:00')
const memo = ref('')
const language = ref('ja')
const editingEventId = ref(null)


const daysOfWeekMap = {
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

const localizedDaysOfWeek = computed(() => daysOfWeekMap[language.value] || daysOfWeekMap.ja)

const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const animationDirection = ref('dropDown')

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime())
}

const calendar = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)

  const calendarDays = []
  let week = []

  for (let i = 0; i < firstDay.getDay(); i++) week.push(new Date(NaN))
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(currentYear.value, currentMonth.value, d)
    week.push(date)
    if (week.length === 7) {
      calendarDays.push(week)
      week = []
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(new Date(NaN))
    calendarDays.push(week)
  }
  return calendarDays
})

const filteredEvents = computed(() =>
  schedules.value.filter(event => {
    const date = new Date(event.date)
    return (
      date.getFullYear() === currentYear.value &&
      date.getMonth() === currentMonth.value
    )
  })
)

const isFormFilled = computed(() => title.value.trim() && startTime.value && endTime.value)

const selectedEvents = ref([])

watch(selectedEvent, (event) => {
  if (!event) return
  title.value = event.title ?? ''
  startTime.value = event.startTime ?? '12:00'
  endTime.value = event.endTime ?? '13:00'
  memo.value = event.memo ?? ''
})

watch(startTime, (newStart) => {
  const startHour = parseInt(newStart.split(':')[0])
  const endHour = parseInt(endTime.value.split(':')[0])
  if (endHour <= startHour) {
    const nextHour = (startHour + 1).toString().padStart(2, '0')
    endTime.value = `${nextHour}:00`
  }
})

function isToday(date) {
  return date.toDateString?.() === today.toDateString?.()
}

function hasEvent(date) {
  const target = date.toLocaleDateString?.('sv-SE')
  return schedules.value.some(item => item.date === target)
}

function getEvents(date) {
  const target = date.toLocaleDateString?.('sv-SE')
  return schedules.value.filter(item => item.date === target)
}




function openModal(date) {
  if (!isValidDate(date)) return
  selectedDate.value = date

  const dateKey = date.toLocaleDateString('sv-SE')
  selectedEvents.value = schedules.value.filter(e => e.date === dateKey)

  // ✨ 新規入力モードとして初期化
  editingEventId.value = null
  title.value = ''
  memo.value = ''
  const now = new Date()
  const hour = now.getHours().toString().padStart(2, '0')
  startTime.value = `${hour}:00`
  endTime.value = `${(now.getHours() + 1).toString().padStart(2, '0')}:00`
}


function openFromFooter(event) {
  const date = new Date(event.date)
  selectedDate.value = date
  selectedEvent.value = event
  title.value = event.title
  startTime.value = event.startTime
  endTime.value = event.endTime
  memo.value = event.memo
}

function editEvent(event) {
  editingEventId.value = event.id
  selectedEvent.value = event
  title.value = event.title
  startTime.value = event.startTime
  endTime.value = event.endTime
  memo.value = event.memo
}

function nextMonth() {
  animationDirection.value = ''
  setTimeout(() => {
    animationDirection.value = 'slide-left'
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }, 10)
}

function prevMonth() {
  animationDirection.value = ''
  setTimeout(() => {
    animationDirection.value = 'slide-right'
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }, 10)
}

function getHolidayNameSafe(date) {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime?.())) return ''

    // 日本時間に変換して、祝日キーを生成
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)) // UTC+9
    const key = jstDate.toISOString().split('T')[0]

    return holidaysJP.value[key] || ''
  } catch (error) {
    console.error('祝日名の取得に失敗:', error)
    return ''
  }
}
function getEventCellStyle(date) {
  if (!isValidDate(date)) return {}

  const count = getEvents(date).length

  if (count === 0) {
    return { backgroundColor: 'rgba(100, 150, 255, 0.08)' } // 薄い青（静かな空）
  } else if (count === 1) {
    return { backgroundColor: 'rgba(255, 180, 130, 0.18)' } // 夕焼けの始まり
  } else if (count === 2) {
    return { backgroundColor: 'rgba(255, 120, 80, 0.2)' }   // 濃い夕日
  } else {
    return { backgroundColor: 'rgba(180, 60, 60, 0.25)' }   // 日没寸前
  }
}


async function fetchSchedules() {
  const user = await Auth.currentAuthenticatedUser()
  language.value = user.attributes['custom:language'] || 'ja'
  const { data } = await API.graphql(graphqlOperation(listSchedules, {
    filter: { owner: { eq: user.username } }
  }))
  schedules.value = data.listSchedules.items
}

async function createSchedule() {
  const user = await Auth.currentAuthenticatedUser()
  const input = {
    date: selectedDate.value.toLocaleDateString('sv-SE'),
    title: title.value,
    startTime: startTime.value,
    endTime: endTime.value,
    memo: memo.value,
    owner: user.username,
  }
  await API.graphql(graphqlOperation(createScheduleMutation, { input }))
  await fetchSchedules()
  selectedDate.value = null
}

async function updateSchedule() {
  if (!editingEventId.value) return
  const input = {
    id: editingEventId.value,
    date: selectedDate.value.toLocaleDateString('sv-SE'),
    title: title.value,
    startTime: startTime.value,
    endTime: endTime.value,
    memo: memo.value,
  }
  await API.graphql(graphqlOperation(updateScheduleMutation, { input }))
  await fetchSchedules()
  selectedDate.value = null
  editingEventId.value = null
}

async function deleteEvent(id) {
  await API.graphql(graphqlOperation(deleteScheduleMutation, { input: { id } }))
  await fetchSchedules()

  // 🔥 即時に selectedEvents からも削除して反映
  selectedEvents.value = selectedEvents.value.filter(event => event.id !== id)

  // モーダル閉じない限り stay するので、フォームはリセットだけしてOK
  editingEventId.value = null
  selectedEvent.value = null
  title.value = ''
  startTime.value = '12:00'
  endTime.value = '13:00'
  memo.value = ''
}


onMounted(fetchSchedules)
</script>


<style scoped>
.calendar-container {
  padding: 1rem;
  font-family: sans-serif;
  text-align: center;

  /* ▼ 追加部分（簾のように降りるアニメ） */
  animation: dropDown 0.4s ease-out;
  transform-origin: top center;
}

.slide-left {
  animation: slideLeft 0.7s ease-out;
}

.slide-right {
  animation: slideRight 0.7s ease-out;
}


.month-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.month-title button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
  color: #345;
}

.calendar-grid {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.holiday-name {
  font-size: 0.6rem;
  color: crimson;
  margin-top: 2px;
  display: block;
}

.calendar-grid th {
  border: none;
  padding: 0.5rem;
}

.day-circle {
  background-color: rgba(52, 85, 135, 0.15); /* #345 を淡く */
  color: rgba(52, 85, 135, 0.6);             /* 白 → 柔らかブルー */
  border-radius: 50%;
  width: 32px;
  height: 32px;
  line-height: 32px;
  margin: auto;
  font-size: 0.85rem;
}

.calendar-grid td {
  border-top: 1px solid rgba(150, 150, 150, 0.2);    /* やさしいグレー */
  border-bottom: 1px solid rgba(150, 150, 150, 0.2); /* 同じく */
  border-left: none;
  border-right: none;
  height: 80px;
  width: 100px;
  vertical-align: top;
  padding: 4px;
  position: relative;
  box-sizing: border-box;
}

.holiday-under-title {
  margin-top: -0.4rem;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  color: crimson;
  font-weight: 500;
  text-align: center;
}

.
today {
  border: 2px solid #274c77;
  position: relative;
}

.event-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-start;
  padding: 1rem 0.5rem;
  margin-top: 1rem;
  border-top: 1px solid #444;
  /* background-color: transparent; */  /* ← 背景を透明にしてもOK */
  background-color: inherit; /* ✅ ページ全体の背景に合わせる */
}

.event-footer .event-sticky {
display: none;
  background-color: #fdf5c0;
  color: #333;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  box-shadow: 1px 1px 3px rgba(255, 255, 255, 0.05);
}


.event-sticky {
  position: relative;
  background-color: #fffcbb;
  border: 1px solid #e0c97f;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.7rem;
  /* margin-top は JS 側で制御する */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1;
}


.today::before {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  background: rgba(255, 0, 0, 0.15);
  border-radius: 50%;
  z-index: 0;
}

.date-number {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  z-index: 2; /* ← ここを追加 */
}

.event-label {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  background: #88f;
  color: white;
  border-radius: 4px;
  padding: 2px 4px;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 1;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.holiday-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  font-size: 0.85rem;
  color: #b94444;
  margin-bottom: 0.5rem;
  background: rgba(255, 0, 0, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}

.event-card {
  background: #f8f8f8;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  color: #333; /* ← ここを明示する */
}

.memo-text {
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 0.4rem;
}


.modal-content {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  width: 320px; /* ← ✅ 横幅を明示的に固定 */
  min-height: 360px; /* ← ✅ 高さも固定済み */
  text-align: left;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.6s ease;
}


.modal-content input {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.4rem;
  font-size: 1rem;
}


.modal-enter-active {
  animation: dropDown 0.4s ease-out;
}

.modal-leave-active {
  animation: flyUp 0.4s ease-in;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn-disabled {
  background-color: #ccc;
  color: #888;
  cursor: not-allowed;
}

.btn-active {
  background-color: #274c77; /* 和風ブルー */
  color: white;
  cursor: pointer;
}

button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.holiday-sticky {
  position: relative;
  background-color: rgba(255, 0, 0, 0.15); /* 当日の背景色に合わせる */
  color: crimson;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.65rem;
  margin-top: 18px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  z-index: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.fade-height-enter-active,
.fade-height-leave-active {
  transition: all 0.3s ease;
}
.fade-height-enter-from,
.fade-height-leave-to {
  opacity: 0;
  transform: scale(0.98);
  max-height: 0;
}
.fade-height-enter-to,
.fade-height-leave-from {
  opacity: 1;
  transform: scale(1);
  max-height: 1000px; /* 適度に大きめに */
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

@keyframes slideLeft {
  0% {
    transform: translateX(40px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideRight {
  0% {
    transform: translateX(-40px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
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



