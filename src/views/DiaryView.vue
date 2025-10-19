<template>
  <div class="gradient-background"></div>
  <div class="diary-container">
    <!-- 年タイトル -->
    <div class="year-header">
      <div class="year-title">
        <button class="arrow-inline" @click="prevYear">&lt;</button>
        <h2 class="diary-title">{{ $t('diary.title', { year: currentYear }) }}</h2>
        <button class="arrow-inline" @click="nextYear">&gt;</button>
      </div>
    </div>

    <!-- アイコンボタン類 -->
    <div class="edit-button-wrapper">
      <IconButton :color="selectedColor" size="medium" @click="openNewDiaryModal">✏️</IconButton>
      <IconButton :color="filterWiltingOnly ? 'white' : selectedColor" size="medium" @click="toggleWiltingFilter">🥀</IconButton>
      <IconButton :color="viewMode === 'list' ? 'white' : selectedColor" size="medium" @click="viewMode = 'list'">📃</IconButton>
      <IconButton :color="viewMode === 'flower' ? 'white' : selectedColor" size="medium" @click="viewMode = 'flower'">🌸</IconButton>
    </div>

    <!-- 枯れたメッセージ -->
    <p v-if="filterWiltingOnly" class="wilted-message">{{ t('message.memoryFlower') }}</p>

    <!-- 花ビュー -->
    <div class="full-flower-area" v-if="viewMode === 'flower'">
      <div
        class="flower"
        v-for="(diary, index) in diaries"
        :key="diary.id"
        :class="{ fading: isFading(diary) }"
        @click="openDiary(diary)"
      >
        <div class="flower-icon">
          <img
            class="flower-img"
            :src="`/dialy.${new Date(diary.date).getMonth() + 1}.png`"
            alt="花"
            @error="e => e.target.style.display = 'none'"
          />
          <div v-if="isRecentlyOpened(diary)" class="butterfly-wrapper">
            <div class="butterfly" :style="{ '--delay': `${(Math.random() * 10).toFixed(2)}s` }">🦋</div>
          </div>
        </div>
        <small>{{ formatDate(diary.date) }}</small>
      </div>
    </div>

<div
  v-if="viewMode === 'list'"
  class="diary-memo-list"
  :key="viewMode"
>
  <div
    v-for="(diary, index) in sortedDiaries"
    :key="diary.id"
    class="diary-memo-card fade-down"
    :style="{ animationDelay: `${index * 0.1}s` }"
  >
    <div class="diary-date">{{ formatDate(diary.date) }}</div>
    <div class="diary-text">{{ truncate(diary.content) }}</div>
  </div>    
</div>

    <!-- モーダル：新規作成 -->
    <transition name="drop-modal">
      <div class="diary-modal-overlay" v-if="showNewDiaryModal" @click.self="closeModal">
        <div class="diary-modal" @click.stop>
          <div class="note-date">
            <input type="date" v-model="selectedDate" class="diary-date-input" />
          </div>
          <div
            class="note-editor"
            contenteditable="true"
            :data-placeholder="$t('diary.placeholder')"
            @input="handleInput"
            @keyup="handleInput"
            @compositionend="handleInput"
            ref="editor"
          />
          <div class="button-row">
            <YamatoButton
              type="default"
              @click="saveDiary"
              :disabled="!newDiaryContent.replace(/\s/g, '')"
            >
              {{ t('save') }}
            </YamatoButton>
          </div>
        </div>
      </div>
    </transition>

    <!-- モーダル：閲覧 -->
    <transition name="drop-modal">
      <div class="modal" v-if="selectedDiary">
        <div class="modal-background" @click="closeDiaryModal"></div>
        <div class="diary-modal" @click.stop>
          <div class="modal-header">
            <div class="note-date center">{{ formatDisplayDate(selectedDiary.date) }}</div>
            <IconButton
              class="menu-button no-bg no-radius"
              :color="'transparent'"
              size="small"
              @click="showDiaryMenu = true"
            >
              ⋯
            </IconButton>
          </div>
          <div class="note-editor" v-text="selectedDiary.content"></div>
        </div>

        <ConfirmDialog
          v-if="showDiaryMenu"
          :visible="true"
          :message="t('confirm.delete')"
          @confirm="handleConfirmedDelete"
          @cancel="showDiaryMenu = false"
        />
      </div>
    </transition>
  </div>
</template>



<script setup>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ref, onMounted } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { createDiary, deleteDiary as deleteDiaryMutation, updateDiary as updateDiaryMutation } from '@/graphql/mutations'
import { listDiaries } from '@/graphql/queries'
import YamatoButton from '@/components/YamatoButton.vue'
import Modal from '@/components/Modal.vue'
import IconButton from '@/components/IconButton.vue'
import { computed } from 'vue'

import { useRouter } from 'vue-router'
const router = useRouter()

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const viewMode = ref('flower') 


const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'flower' ? 'list' : 'flower'
}

const selectedColor = ref('#274c77')

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  selectedColor.value = user.attributes['custom:iconColor'] || '#274c77'
})

const currentYear = ref(new Date().getFullYear())
const diaries = ref([])
const positions = ref([])

const selectedDiary = ref(null)
const showNewDiaryModal = ref(false)
const newDiaryContent = ref('')
const selectedDate = ref('')

const backgrounds = [
  '/back.1.png',
  '/back.2.png',
  '/back.3.png'
]

const currentIndex = ref(0)
const editor = ref(null)

const showDiaryMenu = ref(false)

const sortedDiaries = computed(() => {
  return diaries.value.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
})


function handleConfirmedDelete() {
  if (selectedDiary.value?.id) {
    deleteDiary(selectedDiary.value.id)
    showDiaryMenu.value = false
  }
}


onMounted(() => {
  fetchDiaries()

  // 背景フェード切り替え
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % backgrounds.length
  }, 6000)
})

function openNewDiaryModal() {
  selectedDate.value = new Date().toLocaleDateString('sv-SE') // ← UTC回避
  newDiaryContent.value = ''
  showNewDiaryModal.value = true
}

function closeModal() {
  showNewDiaryModal.value = false
  selectedDiary.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })  // ✅ トップに戻す
}

function closeDiaryModal() {
  selectedDiary.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' }) // ← これ！
}

async function openDiary(diary) {
  selectedDiary.value = diary

  try {
    const updatedTime = new Date().toISOString()
    await API.graphql(graphqlOperation(updateDiaryMutation, {
      input: {
        id: diary.id,
        lastOpenedAt: updatedTime
      }
    }))

    // ✅ ローカル更新も反映させる
    diary.lastOpenedAt = updatedTime

    console.log(`✅ lastOpenedAt 更新: ${diary.id}`)
  } catch (err) {
    console.error(`❌ 更新失敗: ${diary.id}`, err)
  }
}

async function saveDiary() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const input = {
      date: selectedDate.value,
      content: newDiaryContent.value,
      owner: user.username
    }
    await API.graphql(graphqlOperation(createDiary, { input }))
    await fetchDiaries()
    closeModal()
  } catch (e) {
    console.error('保存失敗:', e)
  }
}

async function deleteDiary(id) {
  try {
    await API.graphql(graphqlOperation(deleteDiaryMutation, { input: { id } }))
    await fetchDiaries()
    closeDiaryModal()
  } catch (e) {
    console.error('削除失敗:', e)
  }
}

async function fetchDiaries() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const res = await API.graphql(graphqlOperation(listDiaries, {
      filter: {
        owner: { eq: user.username },
        date: { beginsWith: `${currentYear.value}-` }
      }
    }))

    const all = res.data.listDiaries.items
    const now = new Date()
    const toKeep = []
    const toDelete = []

    for (const diary of all) {
      const lastOpened = diary.lastOpenedAt || diary.updatedAt || diary.createdAt
      const diffDays = (now - new Date(lastOpened)) / (1000 * 60 * 60 * 24)

      if (diffDays > 365) {
        toDelete.push(diary.id)
      } else if (filterWiltingOnly.value) {
        if (diffDays >= 330 && diffDays < 365) {
          toKeep.push(diary)
        }
      } else {
        toKeep.push(diary)
      }
    }

    // 不要日記を削除
    for (const id of toDelete) {
      try {
        await API.graphql(graphqlOperation(deleteDiaryMutation, { input: { id } }))
        console.log('🗑️ 削除: ', id)
      } catch (e) {
        console.error('❌ 削除失敗: ', id)
      }
    }

    diaries.value = toKeep.sort((a, b) => new Date(a.date) - new Date(b.date))
    positions.value = Array(12).fill().map(() => [])
  } catch (e) {
    console.error('fetchDiaries error:', e)
  }
}

function diariesByMonth(monthIndex) {
  return diaries.value.filter(d => new Date(d.date).getMonth() === monthIndex)
}


function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function nextYear() {
  currentYear.value++
  fetchDiaries()
}

function prevYear() {
  currentYear.value--
  fetchDiaries()
}

function isRecentlyOpened(diary) {
  if (!diary.lastOpenedAt || diary.lastOpenedAt === diary.createdAt) return false
  const now = new Date()
  const opened = new Date(diary.lastOpenedAt)
  const diffDays = (now - opened) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}
function formatDisplayDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP') // → "2025/05/10"
}

function isFading(diary) {
  const now = new Date()
  const lastOpened = new Date(diary.lastOpenedAt || diary.updatedAt || diary.createdAt)
  const diffDays = (now - lastOpened) / (1000 * 60 * 60 * 24)
  return diffDays >= 330 && diffDays < 365
}
function handleInput(e) {
  newDiaryContent.value = e.target.innerText
}


onMounted(fetchDiaries)

const filterWiltingOnly = ref(false)

function toggleWiltingFilter() {
  filterWiltingOnly.value = !filterWiltingOnly.value
  fetchDiaries()
}

function truncate(text, max = 40) {
  return text?.length > max ? text.slice(0, max) + '…' : text
}


const showList = ref(false)

onMounted(() => {
  setTimeout(() => {
    showList.value = true
  }, 100) // 少し待ってから表示すると自然
})

</script>

<style scoped>
.diary-container {
  width: 100%;           /* ✅ 横幅いっぱいに広げる */
  max-width: none;       /* ✅ 最大幅の制限を解除 */
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
  animation: dropDown 0.5s ease-out;
}

.year-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.3rem;
}

.year-title {
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  gap: 0.5rem;
}

.year-text {
  width: 60px;
  text-align: center;
  color: #000;
}
.diary-title {
  font-size: 1.4rem;
  font-weight: bold;
  font-family: var(--yamato-font-title, 'serif');
  color: var(--yamato-primary);
  margin: 0 1rem;
  text-align: center;
}

.arrow-inline {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #274c77;
  cursor: pointer;
}
.edit-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.edit-button {
background-color: #274c77;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  cursor: pointer;
}


.month-block {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  min-height: 180px;
  background-color: #fafafa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.month-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: left;
  color: #274c77;
}

.note-style {
  background: #f9f5ef;
  background-image: repeating-linear-gradient(

    to bottom,
    #f9f5ef,
    #f9f5ef 28px,
    #d8d3c4 29px
  );
  background-size: 100% 30px;
  padding: 2rem 1rem;
  border-radius: 12px;
  border: 1px solid #d8d3c4;
  max-width: 480px;
  width: 90%;
  font-family: "Hiragino Mincho ProN", "Noto Serif JP", serif;
  color: #111;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.note-date {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #555;
  text-align: left;
}

.note-editor {
  min-height: 200px;
  max-height: 40vh;
  padding: 1rem;
  text-align: left;                 /* ✅ 左詰めに変更 */
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 1rem;
  color: #111;
  line-height: 30px;
  font-family: "Hiragino Mincho ProN", "Noto Serif JP", serif;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow-y: auto;
  margin: 0 auto;                   /* ✴️ 必要に応じて中央寄せ枠だけ維持 */
}


.butterfly-wrapper {
  position: absolute;
 top: 8px;
  left: 50%;
  transform: translateX(-50%); /* ✅ 横位置の制御は親で */
}
.fading {
  filter: brightness(0.45) grayscale(60%) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.6));
  transition: filter 0.3s ease;
}


.flower {
  font-size: 1.6rem;
  cursor: pointer;
  user-select: none;
  text-align: center;
  color: #000;
  position: relative; /* ←これを追加！ */
}

@keyframes floatOnce {
  0%   { transform: translate(-50%, 0); }
  10%  { transform: translate(-50%, -6px); }
  20%  { transform: translate(-50%, 0); }
  100% { transform: translate(-50%, 0); }
}

.butterfly {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translate(-50%, 0); /* ✅ 初期位置も中央 */
  z-index: 10;
  font-size: 1.2rem;
  pointer-events: none;

  animation-name: floatOnce;
  animation-duration: 6s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-delay: var(--delay);
}

.note-date {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #555;
  text-align: left;
}
.note-editor {
  min-height: 200px;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 1rem;
  color: #111;
  line-height: 30px;
  font-family: "Hiragino Mincho ProN", "Noto Serif JP", serif;
}

.diary-modal {
  background: #f9f5ef;
  background-image: repeating-linear-gradient(
    to bottom,
    #f9f5ef,
    #f9f5ef 28px,
    #d8d3c4 29px
  );
  background-size: 100% 30px;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #d8d3c4;
  width: 90%;
  max-width: 480px;
  min-width: 280px; /* ✅ 追加：最小幅（黒背景を防ぐ） */
  min-height: 200px; /* ✅ 追加：最小高さ */
  box-sizing: border-box;
  font-family: "Hiragino Mincho ProN", "Noto Serif JP", serif;
  color: #111;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* ✅ 影を自然に */
  background-color: #f9f5ef !important; /* ✅ fallback（念押し） */
margin: auto;

}
.diary-date-input {
  appearance: none;
  -webkit-appearance: none;
  border: none !important;
  background: transparent !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 1rem;
  font-family: "Hiragino Mincho ProN", "Noto Serif JP", serif;
  color: #444;
  border-radius: 0 !important; /* ✅ ← 角丸を完全除去 */
}

/* ✅ Safariなどでのカレンダーアイコン除去 */
.diary-date-input::-webkit-inner-spin-button,
.diary-date-input::-webkit-calendar-picker-indicator {
  display: none !important;
  -webkit-appearance: none;
}

.note-date {
  display: flex;
  justify-content: center;
}
.note-editor {
  min-height: 250px;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 1rem;
  line-height: 30px;
  padding: 0;
  color: #111;
  background: transparent;
  border: none;
}
.diary-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.2);   /* ✅ 少し暗く（透明度0.2） */
  backdrop-filter: blur(1px);      /* ✅ ぼかしで柔らかく */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.note-date {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #555;
  text-align: left;
}

.note-editor:empty::before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
  display: block;
}
/* アニメーション */
@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}

.drop-modal-enter-active {
  animation: dropDown 0.4s ease-out;
}
.drop-modal-leave-active {
  animation: flyUp 0.4s ease-in;
}

.flower-icon {
  position: relative;
  width: 60px;
  height: 60px;           /* ✅ 花画像の高さと揃える */
  pointer-events: none;
}

.flower-img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  display: block;
  margin: 0;
  pointer-events: none;
}

.full-flower-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  column-gap: 0.3rem;
  row-gap: 1.2rem;
  padding: 0.5rem 0.2rem 2rem 0.2rem; /* ← 左右を 0.5rem → 0.2rem に縮小 */
  width: 100%;
  justify-items: center;
  align-items: start;
}

/* スマホ専用の微調整 */
@media (max-width: 480px) {
  .full-flower-area {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); /* より狭い幅でも2列維持 */
    gap: 0.4rem;
    padding: 0.5rem;
  }
}

.flower small {
  display: block;
  margin-top: 0.2rem;       /* ✅ 少し詰める */
  font-size: 0.75rem;       /* ✅ 少し小さめでスマートに */
  line-height: 1;
  color: #000;              /* ✅ ノート背景とのコントラスト強調 */
  text-align: center;
}
.gradient-background {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;

  background-image: repeating-linear-gradient(
    to bottom,
    #f9f5ef,
    #f9f5ef 28px,
    #d8d3c4 29px
  );
  background-size: 100% 30px;
}

.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 1000;
}

.modal-background {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
  z-index: 1;
}

.diary-modal {
  position: relative;
  z-index: 2;
}

.note-editor:empty:before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
}

.modal-header {
  position: relative;
  margin-bottom: 1rem;
}

.note-date.center {
  font-family: "Hiragino Mincho ProN", "Noto Serif JP", serif;
  font-weight: normal;
  font-size: 1rem;
  color: #444;
}

/* ...メニューの配置 */
.menu-button {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
}

/* 背景なし + 角丸除去 */
.no-bg {
  background-color: transparent !important;
  box-shadow: none !important;
}
.no-radius {
  border-radius: 0 !important;
}
.icon-button.active {
  border: 2px solid #cc4444;
  box-shadow: 0 0 4px rgba(204, 68, 68, 0.6);
}
.edit-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  gap: 1rem; /* ← ✅ この行が隙間を作ります */
}
.wilted-message {
  margin: 0.5rem 0 1rem;
  font-size: 0.95rem;
  color: #888;
  font-style: italic;
  text-align: center;
  animation: driftFade 3s ease-out forwards;
  opacity: 0;
}

@keyframes driftFade {
  0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(-10px) rotate(-1deg); opacity: 0.85; }
}

.note-list-view {
  display: flex;
  flex-direction: column;
  align-items: center;  /* ⬅ ノートを中央寄せに */
  gap: 2rem;            /* ⬅ ノート同士の間隔 */
  padding: 1rem 0 4rem;
}
.diary-memo-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-bottom: 2rem;
}
.diary-memo-card {
  background: #fff;
  width: 90%;
  max-width: 460px;
  padding: 1rem;
  border-radius: 12px;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: left;
}
.diary-date {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}
.diary-text {
  font-size: 1rem;
  color: #222;
  white-space: pre-wrap;
}

@keyframes fadeDown {
  0% {
    opacity: 0;
    transform: translateY(-24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-down {
  opacity: 0; /* 初期状態 */
  animation: fadeDown 0.4s ease-out forwards;
}

</style>

