<template>

  <div class="calendar-container" :class="animationDirection">
    <!-- 月表示 -->
    <h2 class="month-title">
      <button @click="prevMonth">&lt;</button>
      {{ language === 'en' ? monthsEn[currentMonth] : (currentMonth + 1) + '月' }}
      <button @click="nextMonth">&gt;</button>
    </h2>


    <!-- テンプレートショートカット -->
    <div class="template-shortcut">
<IconButton :color="selectedColor" size="medium" @click="handleQuickTagClick">＋</IconButton>
<IconButton :color="selectedColor" size="medium" @click="goToTemplateView">🏷️</IconButton>
    </div>

    <!-- カレンダーグリッド -->
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
            <div
              v-if="getHolidayNameSafe(date)"
              class="holiday-sticky"
              :title="getHolidayNameSafe(date)"
            >
              {{ getHolidayNameSafe(date).length > 6 ? getHolidayNameSafe(date).slice(0, 6) + '…' : getHolidayNameSafe(date) }}
            </div>
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

    <!-- イベントモーダル -->
    <Modal :visible="selectedDate !== null" customClass="compact" @close="resetModal">
      <template #default>
        <transition name="fade-height" mode="out-in">
          <div :key="isEditing ? 'edit' : 'view'" class="modal-inner" :class="animationDirection">
            <!-- 日付ヘッダーと祝日 -->
            <div class="date-header-with-icon">
              <h3>{{ selectedDate?.toLocaleDateString() }}</h3>
<IconButton
  v-if="!isEditing && selectedEvents.length"
  @click="resetNewEvent"
  size="small"
  :color="selectedColor"
>
  ＋
</IconButton>
            </div>
            <p v-if="getHolidayNameSafe(selectedDate)" class="holiday-tag">
              🇯🇵 {{ getHolidayNameSafe(selectedDate) }}
            </p>

            <!-- 一覧表示 -->
            <div v-if="selectedEvents.length && !isEditing">
              <div
                class="event-card"
                v-for="(event, index) in selectedEvents"
                :key="event.id || index"
              >
                <p><strong>{{ event.title }}</strong></p>
                <p>{{ event.startTime }} - {{ event.endTime }}</p>
                <p class="memo-text">{{ event.memo }}</p>
                <div class="button-container-row">
<IconButton
  :color="selectedColor"
  size="small"
  @click="startEdit(event)"
>
  ✏️
</IconButton>

<IconButton
  :color="selectedColor"
  size="small"
  class="danger"
  @click="deleteEvent(event.id)"
>
  🗑️
</IconButton>
                </div>
              </div>
            </div>

            <!-- 編集・追加モード -->
            <div v-else>
              <input v-model="title" :placeholder="t.title[language]" />
              <div class="template-tag-row" v-if="templates.length">
<YamatoButton
  v-for="tpl in templates"
  :key="tpl.id"
  :color="selectedColor"
  size="small"
  @click="applyTemplate(tpl)"
>
  {{ tpl.emoji }} {{ tpl.label }}
</YamatoButton>
              </div>
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
                <YamatoButton v-if="selectedEvents.length" @click="cancelEdit">
                  戻る
                </YamatoButton>
              </div>
            </div>
          </div>
        </transition>
      </template>
    </Modal>

    <!-- クイックタグモーダル -->
    <Modal :visible="showQuickTagModal" @close="showQuickTagModal = false">
      <template #default>
        <!-- 🌸 タイトル -->
        <h3 class="modal-title">テンプレート一括登録</h3>

        <!-- 🌱 テンプレート選択 -->
        <div class="quick-tag-grid" v-if="templates.length">
 <YamatoButton
    v-for="tpl in templates"
    :key="tpl.id"
    :color="selectedColor"
    size="small"
    :class="{ selected: selectedQuickTemplate?.id === tpl.id }"
    @click="applyQuickTemplate(tpl)"
  >
    {{ tpl.emoji }} {{ tpl.label }}
  </YamatoButton>
        </div>

        <!-- 📅 日付選択 -->
        <div class="date-number-picker">
          <button
            v-for="n in 31"
            :key="n"
            :class="['date-button', { selected: quickDates.includes(n) }]"
            @click="toggleQuickDate(n)"
          >
            {{ n }}
          </button>
        </div>

        <!-- ✅ 登録ボタン -->
        <div class="button-row">
          <YamatoButton @click="registerQuickTagSchedule">登録</YamatoButton>
        </div>
      </template>
    </Modal>
  </div>
</template>



<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { listSchedules, listScheduleTemplates } from '@/graphql/queries'
import {
  createSchedule as createScheduleMutation,
  deleteSchedule as deleteScheduleMutation,
  updateSchedule as updateScheduleMutation
} from '@/graphql/mutations'
import * as Holidays from 'japanese-holidays'
import YamatoButton from '@/components/YamatoButton.vue'
import Modal from '@/components/Modal.vue'
import { useRouter } from 'vue-router'
import IconButton from '@/components/IconButton.vue'

// -----------------------
// 📌 State
// -----------------------
const holidaysJP = ref({})
const templates = ref([])
const showQuickTagModal = ref(false)
const quickTag = ref('')
const quickDates = ref([])
const selectedQuickTemplate = ref(null)
const selectedDate = ref(null)
const selectedEvent = ref(null)
const schedules = ref([])
const title = ref('')
const startTime = ref('12:00')
const endTime = ref('13:00')
const memo = ref('')
const language = ref('ja')
const editingEventId = ref(null)
const endDate = ref(null)

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const animationDirection = ref('')
const selectedColor = ref('#274c77') 

const selectedEvents = ref([])
const router = useRouter()



// -----------------------
// 📌 Constants
// -----------------------
const daysOfWeekMap = {
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
const isFormFilled = computed(() => title.value.trim() && startTime.value && endTime.value)

// -----------------------
// 📌 Fetch & Apply
// -----------------------
async function fetchSchedules() {
  const user = await Auth.currentAuthenticatedUser()
  language.value = user.attributes['custom:language'] || 'ja'
  const { data } = await API.graphql(graphqlOperation(listSchedules, {
    filter: { owner: { eq: user.username } }
  }))
  schedules.value = data.listSchedules.items
}

const isEditing = ref(false)

function startEdit(event) {
  animationDirection.value = 'flyUp'
  setTimeout(() => {
    editingEventId.value = event.id
    isEditing.value = true
    title.value = event.title
    startTime.value = event.startTime
    endTime.value = event.endTime
    memo.value = event.memo
    animationDirection.value = 'dropDown'
  }, 300)
}
async function deleteEvent(id) {
  const confirmed = confirm('本当に削除しますか？')
  if (!confirmed) return

  await API.graphql(graphqlOperation(deleteScheduleMutation, { input: { id } }))
  await fetchSchedules()

  selectedEvents.value = selectedEvents.value.filter(event => event.id !== id)
  editingEventId.value = null
  selectedEvent.value = null
  title.value = ''
  startTime.value = '12:00'
  endTime.value = '13:00'
  memo.value = ''
}

function cancelEdit() {
  isEditing.value = false
  editingEventId.value = null
  selectedEvent.value = null  // ✅ 忘れずにクリア
  title.value = ''
  startTime.value = '12:00'
  endTime.value = '13:00'
  memo.value = ''
}
function resetNewEvent() {
  isEditing.value = true
  editingEventId.value = null
  selectedEvent.value = null
  title.value = ''
  memo.value = ''
  const now = new Date()
  const hour = now.getHours().toString().padStart(2, '0')
  startTime.value = `${hour}:00`
  endTime.value = `${(now.getHours() + 1).toString().padStart(2, '0')}:00`
}

function resetModal() {
  selectedDate.value = null
  isEditing.value = false
  cancelEdit()
}
async function fetchTemplates() {
  const { data } = await API.graphql(graphqlOperation(listScheduleTemplates))
  templates.value = data.listScheduleTemplates.items
}

function applyTemplate(template) {
  title.value = `${template.emoji} ${template.label}`.trim()
  startTime.value = template.startTime
  endTime.value = template.endTime
}

function handleQuickTagClick() {
  if (!templates.value.length) {
    const confirmed = confirm('テンプレートがまだ作成されていません。\n作成画面へ移動しますか？')
    if (confirmed) {
      router.push({ path: '/scheduletemplate' })
    }
  } else {
    showQuickTagModal.value = true
  }
}

function toggleQuickDate(n) {
  const exists = quickDates.value.includes(n)
  if (exists) {
    quickDates.value = quickDates.value.filter(i => i !== n)
  } else {
    quickDates.value.push(n)
  }
}

// -----------------------
// 📌 Utility
// -----------------------
function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime?.())
}
async function registerQuickTagSchedule() {
  const user = await Auth.currentAuthenticatedUser()

  if (!selectedQuickTemplate.value || quickDates.value.length === 0) {
    alert('テンプレートと日付を選んでください')
    return
  }

  for (const day of quickDates.value) {
    const date = new Date(currentYear.value, currentMonth.value, day)

    const input = {
      date: date.toLocaleDateString('sv-SE'),
      title: `${selectedQuickTemplate.value.emoji} ${selectedQuickTemplate.value.label}`.trim(),
      startTime: selectedQuickTemplate.value.startTime,
      endTime: selectedQuickTemplate.value.endTime,
      memo: '',
      owner: user.username
    }

    await API.graphql(graphqlOperation(createScheduleMutation, { input }))
  }

  await fetchSchedules()
  showQuickTagModal.value = false
  quickDates.value = []
  selectedQuickTemplate.value = null
}


function goToDiary(date) {
  if (!date) return
  router.push({ name: 'diary', query: { date: date.toISOString() } })
}

function goToTemplateView() {
  router.push({ path: '/scheduletemplate' })
}

// -----------------------
// 📌 Calendar
// -----------------------
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

function applyQuickTemplate(template) {
  if (selectedQuickTemplate.value?.id === template.id) {
    selectedQuickTemplate.value = null // 再度押すと解除
  } else {
    selectedQuickTemplate.value = template
  }
}

function isToday(date) {
  return date.toDateString?.() === today.toDateString?.()
}

function getEvents(date) {
  const target = date.toLocaleDateString?.('sv-SE')
  return schedules.value.filter(item => item.date === target)
}

function getEventCellStyle(date) {
  if (!isValidDate(date)) return {}
  const count = getEvents(date).length
  if (count === 0) return { backgroundColor: 'rgba(100, 150, 255, 0.08)' }
  else if (count === 1) return { backgroundColor: 'rgba(255, 180, 130, 0.18)' }
  else if (count === 2) return { backgroundColor: 'rgba(255, 120, 80, 0.2)' }
  else return { backgroundColor: 'rgba(180, 60, 60, 0.25)' }
}

function getHolidayNameSafe(date) {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime?.())) return ''
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    const key = jstDate.toISOString().split('T')[0]
    return holidaysJP.value[key] || ''
  } catch (error) {
    console.error('祝日名の取得に失敗:', error)
    return ''
  }
}

// -----------------------
// 📌 Event Handlers
// -----------------------
function openModal(date) {
  if (!isValidDate(date)) return
  selectedDate.value = date
  const dateKey = date.toLocaleDateString('sv-SE')
  selectedEvents.value = schedules.value.filter(e => e.date === dateKey)
  editingEventId.value = null
  title.value = ''
  memo.value = ''
  const now = new Date()
  const hour = now.getHours().toString().padStart(2, '0')
  startTime.value = `${hour}:00`
  endTime.value = `${(now.getHours() + 1).toString().padStart(2, '0')}:00`
}

function editEvent(event) {
  editingEventId.value = event.id
  selectedEvent.value = event
  title.value = event.title
  startTime.value = event.startTime
  endTime.value = event.endTime
  memo.value = event.memo
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

async function createSchedule() {
  const user = await Auth.currentAuthenticatedUser()
  const input = {
    date: selectedDate.value.toLocaleDateString('sv-SE'),
    title: title.value,
    startTime: startTime.value,
    endTime: endTime.value,
    memo: memo.value,
    owner: user.username
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
    memo: memo.value
  }

  await API.graphql(graphqlOperation(updateScheduleMutation, { input }))
  await fetchSchedules()

  // ✅ 一度 flyUp で上げて…
  animationDirection.value = 'flyUp'

  setTimeout(() => {
    // ✅ 下ろす前に isEditing を false にして表示を切り替える
    editingEventId.value = null
    isEditing.value = false

    // 🎯 そのあと dropDown で戻す
    animationDirection.value = 'dropDown'

    // ✅ 再表示に向けて一覧を抽出
    const dateKey = selectedDate.value.toLocaleDateString('sv-SE')
    selectedEvents.value = schedules.value.filter(e => e.date === dateKey)

    // 入力クリア
    title.value = ''
    startTime.value = '12:00'
    endTime.value = '13:00'
    memo.value = ''
  }, 300) // 🕒 CSSアニメーションと同じ時間に合わせる
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

// -----------------------
// 📌 Watchers
// -----------------------
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

// -----------------------
// 📌 Initialization
// -----------------------
onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    selectedColor.value = user.attributes['custom:iconColor'] || '#274c77'

    const [_, __, holidayRes] = await Promise.all([
      fetchSchedules(),
      fetchTemplates(),
      fetch('https://holidays-jp.github.io/api/v1/date.json')
    ])
    holidaysJP.value = await holidayRes.json()
  } catch (error) {
    console.error('初期化エラー:', error)
  }
})


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

  .template-tag {
    background-color: #2a2a2a;
    color: #fff;
    border: 1px solid #555;
  }

  .template-tag:hover {
    background-color: #444;
  }
}

.template-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.8rem 0;
  justify-content: center;
}

.template-tag {
  background-color: #eee;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid #ccc;
  color: #111; /* ← 追加：黒文字に */
}

.template-tag:hover {
  background-color: #ddd;
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
.template-shortcut {
  display: flex;
  justify-content: center;
  gap: 1rem; /* ← この行を追加 */
  margin-top: 0.5rem; /* 任意で上に余白も */
}

.icon-circle {
  background-color: var(--yamato-primary);
  color: var(--yamato-text-light);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}
.quick-tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  margin-top: 1rem;
}
.date-number-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 1rem;
  justify-content: center;
}

.date-button {
  width: 36px;
  height: 36px;
  font-size: 0.9rem;
  border-radius: 50%;
  border: 1px solid #ccc;
  background-color: #eee;
  cursor: pointer;
}
.date-button.selected {
  background-color: var(--yamato-button-color);
  color: var(--yamato-button-text);
  border: none;
}

.template-tag.selected {
  background-color: var(--yamato-primary);
  color: white;
  border-color: var(--yamato-primary);
}

.date-header-with-icon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.modal-inner.dropDown {
  animation: dropDown 0.4s ease-out;
}
.modal-inner.flyUp {
  animation: flyUp 0.4s ease-in;
}


.month-title-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.arrow-button {
  font-size: 1.2rem;
  padding: 0.4rem 1.2rem;
  background-color: var(--yamato-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
}

.arrow-button:hover {
  background-color: #345;
}

.month-text {
  font-size: 1.5rem;
  font-weight: bold;
}


.yamato-button.selected {
  background-color: white !important;
  color: var(--yamato-primary) !important;
  border: 2px solid var(--yamato-primary);
}

</style>



