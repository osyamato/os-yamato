<template>
  <div class="calendar-container" :class="animationDirection">
    <h2 class="month-title">
      <button @click="prevMonth">&lt;</button>
      {{ language === 'en' ? monthsEn[currentMonth] : (currentMonth + 1) + '月' }}
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
            :class="{ today: !isNaN(date?.getTime?.()) && isToday(date) }"
            :style="getEventCellStyle(date)"
            @click="openModal(date)"
          >
            <span v-if="!isNaN(date?.getTime?.())" class="date-number">
              {{ date.getDate() }}
            </span>

            <!-- 祝日 -->
            <div
              v-if="getHolidayNameSafe(date)"
              class="holiday-sticky"
              :title="getHolidayNameSafe(date)"
            >
              {{ getHolidayNameSafe(date).length > 6
                ? getHolidayNameSafe(date).slice(0, 6) + '…'
                : getHolidayNameSafe(date)
              }}
            </div>

            <!-- イベント -->
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

<Modal :visible="selectedDate !== null" customClass="compact" @close="selectedDate = null">
  <template #default>
    <div class="date-wrapper">
      <h3>{{ selectedDate?.toLocaleDateString() }}</h3>
      <button class="diary-pencil" @click="goToDiary(selectedDate)">✏️</button>
    </div>

    <p v-if="getHolidayNameSafe(selectedDate)" class="holiday-tag">
      🇯🇵 {{ getHolidayNameSafe(selectedDate) }}
    </p>

    <transition name="fade-height" mode="out-in">
      <div key="modal-inner" class="modal-inner">
        <!-- 既存の予定 -->
        <div v-if="selectedEvents.length">
          <div
            class="event-card"
            v-for="(event, index) in selectedEvents"
            :key="event.id || index"
          >
            <p><strong>{{ event.title }}</strong></p>
            <p>{{ event.startTime }} - {{ event.endTime }}</p>
            <p class="memo-text">{{ event.memo }}</p>
            <div class="button-container-row">
              <YamatoButton @click="editEvent(event)">{{ t.edit[language] }}</YamatoButton>
              <YamatoButton type="danger" @click="deleteEvent(event.id)">
                {{ t.delete[language] }}
              </YamatoButton>
            </div>
          </div>
          <hr />
        </div>

        <!-- 入力フォーム -->
        <div>
          <input v-model="title" :placeholder="t.title[language]" />
          <input type="time" v-model="startTime" />
          <input type="time" v-model="endTime" />
          <input v-model="memo" :placeholder="t.memo[language]" />
          <div class="button-container-row">
            <YamatoButton
              :disabled="!isFormFilled"
              @click="editingEventId ? updateSchedule() : createSchedule()"
            >
              {{ editingEventId ? t.update[language] : t.add[language] }}
            </YamatoButton>
          </div>
        </div>
      </div>
    </transition>
  </template>
</Modal>
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
import YamatoButton from '@/components/YamatoButton.vue'

import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'

const router = useRouter()

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

const monthsEn = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const t = {
  save: { ja: '保存', en: 'Save' },
  delete: { ja: '削除', en: 'Delete' },
  update: { ja: '更新', en: 'Update' },
  add: { ja: '追加', en: 'Add' },
  close: { ja: '閉じる', en: 'Close' },
  edit: { ja: '編集', en: 'Edit' },
  title: { ja: '予定タイトル', en: 'Title' },
  memo: { ja: 'メモ', en: 'Memo' }
}


const localizedDaysOfWeek = computed(() => daysOfWeekMap[language.value] || daysOfWeekMap.ja)

const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const animationDirection = ref('dropDown')

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime())
}

function goToDiary(date) {
  if (!date) return;
  router.push({
    name: 'diary',  // ← ✅ ここを 'diary' に直す
    query: { date: date.toISOString() }
  });
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
/* 🌸 カレンダー全体 */
.calendar-container {
  padding: 1rem;
  font-family: sans-serif;
  text-align: center;
  animation: dropDown 0.4s ease-out;
  transform-origin: top center;
}

.slide-left {
  animation: slideLeft 0.7s ease-out;
}

.slide-right {
  animation: slideRight 0.7s ease-out;
}

/* 🌸 月タイトル */
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

/* 🌸 曜日見出し */
.calendar-grid {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.calendar-grid th {
  border: none;
  padding: 0.5rem;
}

.day-circle {
  background-color: rgba(52, 85, 135, 0.15);
  color: rgba(52, 85, 135, 0.6);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  line-height: 32px;
  margin: auto;
  font-size: 0.85rem;
}

/* 🌸 日付セル */
.calendar-grid td {
  border-top: 1px solid rgba(150, 150, 150, 0.2);
  border-bottom: 1px solid rgba(150, 150, 150, 0.2);
  height: 80px;
  vertical-align: top;
  padding: 4px;
  position: relative;
  box-sizing: border-box;
}

.date-number {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  z-index: 2;
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

/* 🌸 イベント */
.event-sticky {
  background-color: #fffcbb;
  border: 1px solid #e0c97f;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.7rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 18px;
  z-index: 1;
}

/* 🌸 モーダル */
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 1000;
}

.modal-inner-card {
  background: #fff;
  color: #111;
  border-radius: 14px;
  padding: 1.5rem;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: auto;
}

.modal-inner-card.compact {
 padding: 2rem 1.5rem 1.5rem;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: #fff;
  color: #111;
}

.modal-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: normal;
  margin-bottom: 1rem;
}

.date-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.diary-pencil {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #345;
  padding: 0;
}

input,
textarea {
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
  background: #fff;
  color: #111;
}

.holiday-label,
.holiday-sticky {
  background-color: #fcebea;
  color: #b33939;
  font-size: 0.6rem;
  padding: 0.08rem 0.3rem;
  border-radius: 5px;
  font-weight: 500;
  line-height: 1;
  max-width: 60px;               /* ✅ 幅の上限を小さく制限 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .holiday-label,
  .holiday-sticky {
    font-size: 0.6rem;
    padding: 0.1rem 0.3rem;
  }
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.button-container-row,
.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem; /* ✅ 下の余白を追加 */
}

/* 🌙 ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .modal-inner-card.compact {
    background: #1f1f1f !important;
    color: #f5f5f5 !important;
  }

  input,
  textarea {
    background: #2e2e2e !important;
    color: #fff !important;
    border-color: #444 !important;
  }

  .event-sticky {
    background-color: #fffcd2;
    color: #111 !important;
    border: 1px solid #d8c97f;
  }
}

/* 🌸 アニメーション */
.modal-enter-active {
  animation: dropDown 0.4s ease-out;
}
.modal-leave-active {
  animation: flyUp 0.4s ease-in;
}

@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}

@keyframes slideLeft {
  0% { transform: translateX(40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slideRight {
  0% { transform: translateX(-40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}


</style>



