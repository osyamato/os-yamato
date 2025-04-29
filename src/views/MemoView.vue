<template>
  <div class="memo-container">
    <!-- 🔵 ヘッダー -->
    <div class="memo-header">
      <button class="search-button" @click="openSearchModal">🔍</button>
      <h2>メモ</h2>
      <button class="edit-button" @click="openNewMemoModal">✏️</button>
    </div>

    <!-- 🔵 メモ一覧 -->
<div v-if="filteredMemos.length === 0" class="empty-message">
  登録されたメモがありません
</div>

<div v-else class="memo-list">
  <div
    v-for="memo in filteredMemos"
    :key="memo.id"
    class="memo-card"
    @click="openEditMemoModal(memo)"
  >
    <div class="name-with-icon">
      <span class="flower-icon">{{ getLifeStageIcon(memo) }}</span>
      <p class="memo-content">{{ memo.content }}</p>
    </div>

    <!-- ✅ 作成日 / 更新日 表示 -->
<div class="memo-dates">
  作成: {{ formatDate(memo.createdAt) }}
<span v-if="memo.createdAt && memo.updatedAt && !isSameDay(memo.createdAt, memo.updatedAt)">
  ／ 更新: {{ formatDate(memo.updatedAt) }}
</span>
</div>
</div>
</div>

    <!-- 🔵 新規・編集モーダル -->
    <transition name="modal">
      <div v-if="showModal" class="modal" @click.self="closeModal">
        <div class="modal-content">
          <h3 class="modal-title-icon-only">
            <span class="flower-icon-small">{{ getLifeStageIcon(selectedMemo) }}</span>
          </h3>

          <textarea
            v-model="memoContent"
            :placeholder="selectedMemo ? 'メモを編集...' : 'メモを書く...'"
          />

          <div class="button-row">
            <button class="btn-tag" @click="toggleTagArea">🏷️</button>
          </div>

          <div v-if="showTagArea" class="tag-area">
            <div class="tag-list">
              <button
                v-for="tag in allTags"
                :key="tag"
                class="tag-button"
                :class="{ selected: selectedTags.includes(tag) }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
            <div class="add-tag-input">
              <input v-model="newTagInput" placeholder="新しいタグ..." />
              <button class="add-tag-button" @click="addNewTag">追加</button>
            </div>
          </div>

          <div class="button-row">
            <button
              v-if="selectedMemo"
              class="btn-save"
              :disabled="editMemoContent.trim().length === 0"
              @click="updateSelectedMemo"
            >
              更新
            </button>

            <button
              v-if="selectedMemo"
              class="btn-danger"
              @click="deleteSelectedMemo"
            >
              削除
            </button>

            <button
              v-else
              class="btn-save"
              :disabled="newMemoContent.trim().length === 0"
              @click="saveMemo"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 🔵 タグ検索モーダル -->
    <transition name="modal">
      <div v-if="showSearchModal" class="modal" @click.self="closeSearchModal">
        <div class="modal-content">
          <h3 class="modal-title">タグで検索</h3>
          <div class="tag-list">
            <button
              v-for="tag in allTags"
              :key="tag"
              class="tag-button"
              :class="{ selected: selectedSearchTags.includes(tag) }"
              @click="toggleSearchTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
          <div class="button-row">
            <button class="btn-save" @click="clearSearchTag">すべて表示</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>



<script setup>
import { ref, onMounted, computed } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { createMemo, updateMemo as updateMemoMutation, deleteMemo } from '../graphql/mutations'
import { listMemos } from '../graphql/queries'

// --- データ ---
const memos = ref([])
const showModal = ref(false)
const newMemoContent = ref('')
const selectedTags = ref([])
const allTags = ref([])
const newTagInput = ref('')
const showTagArea = ref(false)

const selectedMemo = ref(null)
const editMemoContent = ref('')
const isEditMode = ref(false) // 🔵 新規作成か編集かを切り替える
const showSearchModal = ref(false)    // 🔍検索モーダル表示
const selectedSearchTags = ref([]) // ←複数選択対応

// --- フィルタ ---
const filteredMemos = computed(() => {
  if (selectedSearchTags.value.length === 0) return memos.value

  return memos.value.filter(memo =>
    memo.tags &&
    memo.tags.some(tag => selectedSearchTags.value.includes(tag))
  )
})
function clearSearchTag() {
  selectedSearchTags.value = []
  showSearchModal.value = false
}
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// --- メモ取得 ---
async function fetchMemos() {
  try {
    const result = await API.graphql(graphqlOperation(listMemos))
    const items = result.data.listMemos.items

    const now = new Date()
    const toDelete = []
    const filtered = items.filter(memo => {
      const updatedAt = new Date(memo.updatedAt || memo.createdAt)
      const diffDays = (now - updatedAt) / (1000 * 60 * 60 * 24)
      if (diffDays > 365) {
        toDelete.push(memo.id)
        return false
      }
      return true
    })

    for (const id of toDelete) {
      try {
        await API.graphql(graphqlOperation(deleteMemo, { input: { id } }))
        console.log(`✅ 古いメモ削除: ${id}`)
      } catch (err) {
        console.error(`❌ 削除失敗: ${id}`, err)
      }
    }

    memos.value = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // タグ一覧
    const tagsSet = new Set()
    filtered.forEach(m => (m.tags || []).forEach(tag => tagsSet.add(tag)))
    allTags.value = Array.from(tagsSet)

  } catch (err) {
    console.error('❌ 読み込み失敗:', err)
  }
}

async function deleteSelectedMemo() {
  if (!selectedMemo.value) return
  if (!confirm('本当にこのメモを削除しますか？')) return

  try {
    await API.graphql(graphqlOperation(deleteMemo, {
      input: { id: selectedMemo.value.id }
    }))
    console.log('✅ メモ削除成功')
    closeModal()
    await fetchMemos()
  } catch (err) {
    console.error('❌ メモ削除失敗:', err)
  }
}

// --- 新規メモ保存 ---
async function saveMemo() {
  if (newMemoContent.value.trim() === '') return
  try {
    await API.graphql(graphqlOperation(createMemo, {
      input: {
        content: newMemoContent.value.trim(),
        tags: selectedTags.value
      }
    }))
    closeModal()
selectedSearchTags.value = []
    await fetchMemos()
  } catch (err) {
    console.error('保存失敗:', err)
  }
}

async function updateSelectedMemo() {
  if (!selectedMemo.value || editMemoContent.value.trim() === '') return
  try {
    await API.graphql(graphqlOperation(updateMemoMutation, {
      input: {
        id: selectedMemo.value.id,
        content: editMemoContent.value.trim(),
        tags: selectedTags.value  // ← ここ！！！重要！！
      }
    }))
    closeModal()
selectedSearchTags.value = []
    await fetchMemos()
  } catch (err) {
    console.error('更新失敗:', err)
  }
}

// --- 新規モーダルを開く ---
function openNewMemoModal() {
  newMemoContent.value = ''
  selectedTags.value = []
  selectedMemo.value = null
  editMemoContent.value = ''
  isEditMode.value = false
  showTagArea.value = false // ✅ タグエリアも閉じる
  showModal.value = true
}

// --- 既存メモを開く ---
function openMemo(memo) {
  selectedMemo.value = memo
  editMemoContent.value = memo.content
  selectedTags.value = memo.tags ? [...memo.tags] : []
  isEditMode.value = true
  showTagArea.value = false // ✅ タグエリアも閉じる
  showModal.value = true
}

function openEditMemoModal(memo) {
  selectedMemo.value = memo
  editMemoContent.value = memo.content
  selectedTags.value = memo.tags ? [...memo.tags] : []
  isEditMode.value = true
  showTagArea.value = false // ←★ これ必ず入れる！
  showModal.value = true
}

// --- 閉じる ---
function closeModal() {
  showModal.value = false
  isEditMode.value = false
}

// --- タグエリアの開閉 ---
function toggleTagArea() {
  showTagArea.value = !showTagArea.value
}

// --- タグ選択トグル ---
function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

function toggleSearchTag(tag) {
  if (selectedSearchTags.value.includes(tag)) {
    selectedSearchTags.value = selectedSearchTags.value.filter(t => t !== tag)
  } else {
    selectedSearchTags.value.push(tag)
  }
}

const memoContent = computed({
  get() {
    return selectedMemo.value ? editMemoContent.value : newMemoContent.value
  },
  set(value) {
    if (selectedMemo.value) {
      editMemoContent.value = value
    } else {
      newMemoContent.value = value
    }
  }
})

// --- 新しいタグ追加 ---
function addNewTag() {
  const newTag = newTagInput.value.trim()
  if (newTag && !allTags.value.includes(newTag)) {
    allTags.value.push(newTag)
    selectedTags.value.push(newTag)
  }
  newTagInput.value = ''
}

// --- 成長アイコン 🌱🌷🥀
function getLifeStageIcon(memo) {
  if (!memo || (!memo.createdAt && !memo.updatedAt)) return '🌱'

  const now = new Date()
  const baseDate = memo.updatedAt ? new Date(memo.updatedAt) : new Date(memo.createdAt)

  // baseDateが無効な場合もカバー
  if (isNaN(baseDate)) return '🌱'

  const diffDays = (now - baseDate) / (1000 * 60 * 60 * 24)

  if (diffDays < 180) return '🌱'
  else if (diffDays < 330) return '🌷'
  else return '🥀'
}

function openSearchModal() {
  showSearchModal.value = true
}

function closeSearchModal() {
  showSearchModal.value = false
}

function isSameDay(date1, date2) {
  if (!date1 || !date2) return false
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  if (isNaN(d1) || isNaN(d2)) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}


// --- 初回ロード ---
onMounted(fetchMemos)
</script>

<style scoped>
/* 🌸 メモ帳コンテナ */
.memo-container {
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
  animation: dropDown 0.6s ease-out;
}

/* 🌸 ヘッダー */
.memo-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-button {
  background: transparent;   /* ← 背景を消す */
  border: none;              /* ← 枠線を消す */
  font-size: 1.8rem;
  cursor: pointer;
  transition: color 0.3s;
}
.search-button:hover {
  color: #274c77; /* 和風な深い青など */
}
.memo-header h2 {
  font-size: 1.8rem;
}

.edit-button {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  transition: color 0.3s;
}

/* 🌸 メモ一覧 */
.memo-list {
  margin-top: 1rem;
}

.memo-card {
  background: white;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.3rem;
  border-bottom: 1px solid #ccc;
  border-radius: 6px;
  display: flex;
  flex-direction: column; /* ← ★これを追加！縦に並べる */
  font-size: 0.9rem;
  color: #000;
  cursor: pointer;
}

.flower-icon {
  font-size: 1.5rem;
}

.memo-content {
  flex: 1;
  text-align: left;
  font-size: 1rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* ここで3行に制限 */
  -webkit-box-orient: vertical;
}

/* 🌸 モーダル */
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
  background: #fff;
  padding: 1.2rem;            /* ⬅ 少しコンパクトに */
  border-radius: 10px;
  width: 95%;                 /* ⬅ 横幅を広めに */
  max-width: 600px;           /* ⬅ タブレット対応 */
  max-height: 90vh;           /* ⬅ 高さを最大90% */
  overflow-y: auto;           /* ⬅ メモが多いときにスクロール */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.modal-title-icon-only {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flower-icon-small {
  font-size: 1.2rem;
  margin: 0;
}

textarea {
  min-height: 260px;      /* 最低高さ（短文でも見やすい） */
  max-height: 400px;      /* 最大高さ（長文でも伸びすぎない） */
  height: auto;           /* 高さは中身に応じて伸縮 */
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;       /* ユーザーが手動で調整可能 */
  padding: 1rem;          /* 見た目を整えるための内側余白 */
  width: 100%;            /* モーダル幅にフィット */
  box-sizing: border-box; /* padding含めた正確なサイズ調整 */
}

/* 🌸 ボタンエリア */
.button-row {
  margin-top: 0.5rem;  /* ← 1.5rem → 0.5rem に変更 */
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* 他のボタンはそのまま */
.btn-save,
.add-tag-button {
  background-color: #274c77;
  color: white;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* 🏷️ボタンだけはアイコン風に */
.btn-tag {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  padding: 0;
  margin: 0; /* ← ここがポイント！ */
  line-height: 1;
}

.btn-tag:hover {
  opacity: 0.7;
}

.btn-save:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

/* 🌸 タグエリア */
.tag-area {
  margin-top: 1.5rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.tag-area h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #555;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-button {
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 9999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-button.selected {
  background: #dce5f4;
  color: #274c77;
  font-weight: bold;
  border-color: #274c77;
}

/* 🌸 タグ新規作成 */
.add-tag-input {
  display: flex;
  gap: 0.5rem;
}

.add-tag-input input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.empty-message {
  margin-top: 2rem;
  color: #888;
  font-size: 1.1rem;
}

.btn-danger {
  background-color: #f8d7da;      /* 淡い赤（薄ピンク） */
  color: #721c24;                 /* 濃い赤茶系の文字色 */
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-danger:hover {
  background-color: #f5c6cb;      /* 少し濃くなる赤 */
}

.memo-list {
  margin: 0 1rem;
}

.memo-card {
  background: white;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.3rem;
  border-bottom: 1px solid #ccc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #000;
  cursor: pointer;
}

.name-with-icon {
  display: flex;
  align-items: center;
  margin-bottom: 0.3rem;
}

.flower-icon {
  font-size: 1.2rem;
  margin-right: 0.4rem;
  vertical-align: middle;
}

.memo-content {
  font-size: 1rem;
  text-align: left;
}

.memo-dates {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.2rem;
  text-align: right;
}

/* 🌸 アニメーション */
@keyframes dropDown {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes flyUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-30px);
    opacity: 0;
  }
}

/* モーダルが表示されるとき */
.modal-enter-active {
  animation: dropDown 0.4s ease-out;
}

/* モーダルが消えるとき */
.modal-leave-active {
  animation: flyUp 0.3s ease-in;
}

</style>

