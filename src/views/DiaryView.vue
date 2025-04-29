<template>
  <div class="diary-container" :class="animationDirection">
    <div class="month-header">
      <button @click="prevMonth">&lt;</button>
      <h2>{{ currentMonth + 1 }}月の日記</h2>
      <button @click="nextMonth">&gt;</button>
      <button class="edit-button" @click="openNewDiaryModal">✏️</button>
    </div>

    <!-- 新規作成モーダル -->
    <transition name="drop-modal">
      <div class="modal" v-if="showNewDiaryModal" @click.self="closeModal">
        <div class="modal-content">
          <input type="date" v-model="selectedDate" class="date-picker" />
          <textarea v-model="newDiaryContent" placeholder="日記を書く..." />
          <div class="button-row">
            <button class="btn-active" @click="saveDiary">保存</button>
            <button class="btn-disabled" @click="closeModal">閉じる</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 日記表示モーダル -->
    <transition name="drop-modal">
      <div class="modal" v-if="selectedDiary" @click.self="closeDiaryModal">
        <div class="modal-content">
          <p>{{ selectedDiary.content }}</p>
          <div class="button-row">
            <button class="btn-disabled" @click="deleteDiary(selectedDiary.id)">削除</button>
            <button class="btn-disabled" @click="closeDiaryModal">閉じる</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 花エリア -->
    <div class="flower-area">
      <div
        class="flower"
        v-for="(diary, index) in diaries"
        :key="diary.id"
        :style="randomPosition(index)"
        @click="openDiary(diary)"
      >
        🌸<br />
        <small>{{ new Date(diary.date).getDate() }}</small>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { createDiary, deleteDiary as deleteDiaryMutation } from '@/graphql/mutations'
import { listDiaries } from '@/graphql/queries'
import { useRoute } from 'vue-router'
const route = useRoute()
const dateFromQuery = route.query.date || null

const newDiaryContent = ref('')
const selectedDate = ref('')
const showNewDiaryModal = ref(false)
const selectedDiary = ref(null)
const diaries = ref([])
const animationDirection = ref('dropDown')
const positions = ref([])


const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

function openNewDiaryModal() {
  selectedDate.value = new Date().toISOString().split('T')[0]
  newDiaryContent.value = ''
  showNewDiaryModal.value = true
}

function closeModal() {
  showNewDiaryModal.value = false
  selectedDiary.value = null
}

function closeDiaryModal() {
  selectedDiary.value = null
}

function openDiary(diary) {
  selectedDiary.value = diary
}

function randomPosition(index) {
  if (positions.value[index]) {
    return positions.value[index]
  }

  const maxAttempts = 30
  let attempt = 0
  let top, left

  do {
    top = 10 + Math.random() * 60  // 10〜70%
    left = 5 + Math.random() * 85  // 5〜90%
    const isTooClose = positions.value.some(pos => {
      const dx = parseFloat(pos.left) - left
      const dy = parseFloat(pos.top) - top
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < 10
    })

    if (!isTooClose) break
    attempt++
  } while (attempt < maxAttempts)

  const result = {
    top: `${top}%`,
    left: `${left}%`,
    position: 'absolute',
    textAlign: 'center',
  }
  positions.value[index] = result
  return result
}


onMounted(() => {
  if (dateFromQuery) {
    const jstDate = new Date(new Date(dateFromQuery).getTime() + (9 * 60 * 60 * 1000))
    selectedDate.value = jstDate.toISOString().slice(0, 10)
    newDiaryContent.value = ''
    showNewDiaryModal.value = true
  }
  fetchDiaries()
})

async function saveDiary() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const input = {
      date: selectedDate.value,
      content: newDiaryContent.value,
      owner: user.username,
    }
    await API.graphql(graphqlOperation(createDiary, { input }))
    await fetchDiaries()
    closeModal()
  } catch (e) {
    console.error('createDiary error:', e.errors?.[0]?.message || e)
  }
}

async function deleteDiary(id) {
  await API.graphql(graphqlOperation(deleteDiaryMutation, { input: { id } }))
  await fetchDiaries()
  closeDiaryModal()
}

async function fetchDiaries() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const res = await API.graphql(graphqlOperation(listDiaries, {
      filter: {
        owner: { eq: user.username },
        date: {
          beginsWith: `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`
        }
      }
    }))
    diaries.value = res.data.listDiaries.items
    positions.value = [] // 🌸花位置リセット
  } catch (e) {
    console.error('fetchDiaries error:', e)
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).getDate() + '日'
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
    diaries.value = []
    fetchDiaries()
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
    diaries.value = []
    fetchDiaries()
  }, 10)
}

onMounted(fetchDiaries)
</script>

<style scoped>
.diary-container {
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
  position: relative;
  animation: dropDown 0.4s ease-out;
  transform-origin: top center;
}

.date-picker {
  border: none;
  background: transparent;
  font-size: 1rem;
  font-family: serif;
  margin-bottom: 1rem;
  padding: 0.5rem;
  outline: none;
}

.month-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: nowrap;
  margin-bottom: 1rem;
}

.month-header button {
  background: transparent; /* 背景なくす */
  border: none;             /* 枠線も消す */
  font-size: 1.2rem;
  cursor: pointer;
}

.edit-button {
  font-size: 1.5rem;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 8px;
  background: transparent; 
  cursor: pointer;
}

input[type="date"], textarea {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #f9f5ef;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #d8d3c4;
  width: 90%;
  max-width: 400px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  background-image: repeating-linear-gradient(
    to bottom,
    #f9f5ef,
    #f9f5ef 28px,
    #d8d3c4 29px
  );
  background-size: 100% 30px;

  font-family: "serif", "Hiragino Mincho ProN", "Noto Serif JP", serif;
  color: #000; /* ← ここを黒に明示 */
}

/* 閲覧モーダル内の日記本文 */
.modal-content p {
  font-size: 1rem;
  line-height: 30px;
  white-space: pre-wrap;
  color: #000; /* ← 明確に黒文字 */
  margin: 0;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

textarea {
  width: 100%;
  height: 200px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 30px; /* ← 横線にぴったり合わせる */
  background: transparent;
  border: none;
  resize: none;
  box-sizing: border-box;
  font-family: serif;
}

.btn-disabled, .btn-active {
  font-size: 0.8rem; /* ✅ 小さめに */
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: none;
}

.btn-disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.btn-active {
  background-color: #345;
  color: white;
  cursor: pointer;
}

.flower-area {
  position: relative;
  height: 60vh;
}

.flower {
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  text-align: center;
}

/* アニメーション系 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-left {
  animation: slideLeft 0.5s ease-out;
}
.slide-right {
  animation: slideRight 0.5s ease-out;
}

.drop-modal-enter-active {
  animation: dropDown 0.4s ease-out;
}

.drop-modal-leave-active {
  animation: flyUp 0.4s ease-in;
}

@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes slideLeft {
  0% { transform: translateX(40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slideRight {
  0% { transform: translateX(-40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
</style>


