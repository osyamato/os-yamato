<template>
  <div class="calendar-view">
    <h2>📅 カレンダー</h2>
    <table class="calendar">
      <thead>
        <tr>
          <th v-for="(day, index) in daysOfWeek" :key="index">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, wIndex) in calendar" :key="wIndex">
          <td v-for="(day, dIndex) in week" :key="dIndex">
            <div class="day-cell">
              <span v-if="day">{{ day }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土']
const calendar = ref([])

function generateCalendar(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()

  const startDayOfWeek = firstDay.getDay()
  const weeks = []
  let week = new Array(7).fill(null)

  for (let i = 0; i < startDayOfWeek; i++) {
    week[i] = null
  }

  for (let day = 1; day <= totalDays; day++) {
    week[startDayOfWeek] = day
    startDayOfWeek++
    if (startDayOfWeek === 7 || day === totalDays) {
      weeks.push(week)
      week = new Array(7).fill(null)
      startDayOfWeek = 0
    }
  }

  calendar.value = weeks
}

onMounted(() => {
  const today = new Date()
  generateCalendar(today.getFullYear(), today.getMonth())
})
</script>

<style scoped>
.calendar-view {
  padding: 2rem;
  font-size: 1rem;
  text-align: center;
}

.calendar {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.calendar th,
.calendar td {
  width: 14.2%;
  height: 80px;
  border: 1px solid #ccc;
  vertical-align: top;
  text-align: right;
  padding: 0.5rem;
}

.day-cell {
  position: relative;
  font-weight: bold;
  color: #333;
}
</style>
