<template>
  <div class="memo-container">
    <!-- ヘッダー -->
    <div class="memo-header">
      <h2 class="header-title">メモ</h2>

<!-- 1段目 -->
<div class="header-icons">
  <IconButton :color="iconColor" @click="openSearchModal">🔍</IconButton>

  <IconButton :color="iconColor" @click="openNewMemoModal">＋</IconButton>

<!-- アイコンボタンと input を分離し、label の for 属性で連携 -->
<IconButton :color="iconColor">
  <label for="file-upload" style="cursor: pointer; margin: 0;">📎</label>
</IconButton>
<input
  id="file-upload"
  type="file"
  accept=".txt"
  @change="handleFileUpload"
  hidden
/>

  <IconButton
    :color="iconColor"
    :class="{ 'selected-icon': isSelectionMode }"
    @click="toggleSelectionMode"
  >☑️</IconButton>

  <IconButton
    :color="iconColor"
    :class="{ 'selected-icon': filterWiltingOnly }"
    @click="toggleWiltFilter"
  >🥀</IconButton>
</div>

<!-- ✅ 2段目 -->
<div v-if="isSelectionMode" class="selection-actions">
  <IconButton :color="iconColor" @click="exportSelectedMemos">↓</IconButton>
  <IconButton :color="iconColor" @click="deleteSelectedMemos">🗑</IconButton>
</div>
    </div>

    <!-- 🥀 詩的メッセージ -->
    <p v-if="filterWiltingOnly" class="wilted-message">
      記憶の花は、いつか風に散る
    </p>

    <!-- メモ一覧 -->
    <div v-if="filteredMemos.length > 0" class="memo-list">
      <div
        v-for="memo in filteredMemos"
        :key="memo.id"
        class="memo-card"
        @click="openEditMemoModal(memo)"
      >
        <div v-if="isSelectionMode" class="checkbox-wrapper">
          <label>
            <input
              type="checkbox"
              :checked="selectedMemoIds.includes(memo.id)"
              @click.stop
              @change="toggleMemoSelection(memo.id)"
            />
          </label>
        </div>

        <span class="flower-icon fixed-icon">{{ getLifeStageIcon(memo) }}</span>
        <p class="memo-content">{{ memo.content }}</p>
        <div class="memo-dates">
          作成: {{ formatDate(memo.createdAt) }}
          <span
            v-if="memo.createdAt && memo.updatedAt && !isSameDay(memo.createdAt, memo.updatedAt)"
          >
            ／ 更新: {{ formatDate(memo.updatedAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ✅ 新規・編集モーダル -->
    <transition name="modal">
      <Modal v-if="showModal" :visible="showModal" @close="closeModal">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <h3 class="modal-title-icon-only">
            <span class="flower-icon-small">{{ getLifeStageIcon(selectedMemo) }}</span>
          </h3>
<IconButton
  v-if="selectedMemo"
  :color="iconColor"
  size="small"
  @click="exportMemo"
>
  ↓
</IconButton>
        </div>

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
          <div class="tag-input-row">
            <input type="text" placeholder="新しいタグ…" v-model="newTagInput" />
            <YamatoButton @click="addTag">追加</YamatoButton>
          </div>
        </div>

        <div class="button-row">
          <YamatoButton
            v-if="selectedMemo"
            size="small"
            :disabled="editMemoContent.trim().length === 0"
            @click="updateSelectedMemo"
          >
            更新
          </YamatoButton>
          <YamatoButton
            v-if="selectedMemo"
            size="small"
            type="danger"
            @click="deleteSelectedMemo"
          >
            削除
          </YamatoButton>
          <YamatoButton
            v-else
            size="small"
            :disabled="newMemoContent.trim().length === 0"
            @click="saveMemo"
          >
            保存
          </YamatoButton>
        </div>
      </Modal>
    </transition>

    <!-- 🔍 タグ検索モーダル -->
    <transition name="modal">
      <Modal v-if="showSearchModal" :visible="showSearchModal" @close="closeSearchModal">
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
          <YamatoButton @click="clearSearchTag">すべて表示</YamatoButton>
        </div>
      </Modal>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { createMemo, updateMemo as updateMemoMutation, deleteMemo } from '../graphql/mutations'
import { listMemos } from '../graphql/queries'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import '@/assets/variables.css'


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
const isSelectionMode = ref(false)
const selectedMemoIds = ref([])


import IconButton from '@/components/IconButton.vue'
import { Auth } from 'aws-amplify'

const iconColor = ref('#274c77')

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
})

function toggleMemoSelection(id) {
  if (selectedMemoIds.value.includes(id)) {
    selectedMemoIds.value = selectedMemoIds.value.filter(i => i !== id)
  } else {
    selectedMemoIds.value.push(id)
  }
}

function clearSelectedMemos() {
  selectedMemoIds.value = []
}
// ✅ これを残す
const filterWiltingOnly = ref(false)

function toggleWiltFilter() {
  filterWiltingOnly.value = !filterWiltingOnly.value
  selectedSearchTags.value = []
  fetchMemos() // ← 追加してもよい
}

const filteredMemos = computed(() => {
  const now = Date.now()

  // 🥀 フィルターがONなら330日以上経過したものだけ
  if (filterWiltingOnly.value) {
    return memos.value.filter(memo => {
      const baseDateStr = memo.updatedAt || memo.createdAt
      if (!baseDateStr) return false

      const baseDate = new Date(baseDateStr)
      if (isNaN(baseDate.getTime())) return false

      const days = (now - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      return days >= 300
    })
  }

  // タグ検索中
  if (selectedSearchTags.value.length > 0) {
    return memos.value.filter(memo =>
      memo.tags && memo.tags.some(tag => selectedSearchTags.value.includes(tag))
    )
  }

  // フィルターなし → 全件
  return memos.value
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

function toggleSelectionMode() {
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) {
    selectedMemoIds.value = []  // ✅ モードOFF時に選択をクリア
  }
}

function exportSelectedMemos() {
  const selected = memos.value.filter(memo => selectedMemoIds.value.includes(memo.id))
  if (selected.length === 0) {
    alert('⚠️ エクスポート対象のメモが選択されていません')
    return
  }

  const content = selected.map(memo => {
    const created = formatDate(memo.createdAt)
    const updated = formatDate(memo.updatedAt)
    const tags = memo.tags?.join(', ') || ''
    return `---\n作成: ${created}${created !== updated ? ` ／ 更新: ${updated}` : ''}\nタグ: ${tags}\n\n${memo.content}\n`
  }).join('\n')

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'selected_memos_export.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file && file.type === 'text/plain') {
    const reader = new FileReader()
    reader.onload = () => {
      openNewMemoModal(reader.result)  // ✅ ここで中身を渡す
    }
    reader.readAsText(file)
  } else {
    alert('⚠️ .txtファイルのみ対応しています。')
  }
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

async function deleteSelectedMemos() {
  if (selectedMemoIds.value.length === 0) {
    alert('⚠️ 削除するメモが選択されていません')
    return
  }

  const confirmed = confirm(`選択された ${selectedMemoIds.value.length} 件のメモを削除しますか？`)
  if (!confirmed) return

  for (const id of selectedMemoIds.value) {
    try {
      await API.graphql(graphqlOperation(deleteMemo, { input: { id } }))
      console.log(`✅ 削除成功: ${id}`)
    } catch (err) {
      console.error(`❌ 削除失敗: ${id}`, err)
    }
  }

  selectedMemoIds.value = []
  await fetchMemos()
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
function openNewMemoModal(contentFromFile = '') {
  newMemoContent.value = typeof contentFromFile === 'string' ? contentFromFile : ''
  selectedTags.value = []
  selectedMemo.value = null
  editMemoContent.value = ''
  isEditMode.value = false
  showTagArea.value = false
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

function addTag() {
  const newTag = newTagInput.value.trim()
  if (newTag && !allTags.value.includes(newTag)) {
    allTags.value.push(newTag)
    selectedTags.value.push(newTag)
  }
  newTagInput.value = ''
}

// --- 成長アイコン 🌱🌷🥀
// --- 成長アイコン 🌱🌷🥀
function getLifeStageIcon(item) {
  if (!item) return '🌱'

  const now = new Date()
  const baseDateStr = item.updatedAt || item.createdAt
  if (!baseDateStr) return '🌱'

  const baseDate = new Date(baseDateStr)
  if (isNaN(baseDate)) return '🌱'

  const diffDays = (now - baseDate) / (1000 * 60 * 60 * 24)

  if (diffDays < 30) return '🌱'       // 発芽
  else if (diffDays < 300) return '🌷' // 成長中
  else return '🥀'                     // 枯れ
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

function exportMemo() {
  if (!selectedMemo.value) {
    alert('エクスポートするメモが見つかりません')
    return
  }

  const memo = selectedMemo.value
  const date = new Date().toISOString().split('T')[0]
  const filename = `memo_${date}.txt`
  const content = `メモ\n\n${memo.content}\n\n作成: ${formatDate(memo.createdAt)}\n更新: ${formatDate(memo.updatedAt)}`

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

onMounted(() => {
  window.scrollTo(0, 0)  // ← 先頭にスクロール
  fetchMemos()           // ← メモを読み込み
})

</script>

<style scoped>
/* 🌸 メモ帳コンテナ */
.memo-container {
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
  animation: dropDown 0.6s ease-out;
}

.memo-header {
  display: flex;
  flex-direction: column; /* ← タイトルとアイコンを縦に並べる */
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.header-title {
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #000;
  text-align: center;
}
@media (prefers-color-scheme: dark) {
  .header-title {
    color: #fff;
  }
}

.header-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
}

.upload-icon {
  cursor: pointer;
}

.checkbox-wrapper {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  z-index: 2;
}

/* 🌸 メモ一覧 */
.memo-list {
  margin-top: 1rem;
}

.memo-card {
  position: relative; /* 🌱 の位置固定に必要 */
  padding: 1.2rem 1rem 1rem 2.5rem; 
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
  font-size: 1.2rem;
}

.memo-content {
  flex: 1;
  text-align: left;
  margin-left: 2rem;
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
  background: rgba(0, 0, 0, 0.3); /* ✅ 少し控えめな黒 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);     /* ✅ 背景をふんわりぼかす */
}

.modal-content {
  background: #fefefe;             /* ✅ ほんのり柔らかい白 */
  padding: 1.5rem;                 /* ✅ 余白を少し広く */
  border-radius: 14px;
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* ✅ 奥行き感UP */
  position: relative;
  z-index: 1001;
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

.fixed-icon {
  position: absolute;
  top: 0.6rem;
  left: 0.8rem;
  font-size: 1.5rem; /* 必要なら調整 */
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
.tag-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.selection-actions {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 0.8rem;
}


@media (prefers-color-scheme: dark) {
  .memo-card {
    background: #2c2c2c; /* 暗めの背景色 */
    color: #f5f5f5;       /* 文字色は白系に */
    border-bottom: 1px solid #555;
  }

  .memo-content {
    color: #f5f5f5; /* 明るめに */
  }

  .memo-dates {
    color: #bbb; /* 日付はやや淡く */
  }
}

@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #2c2c2c; /* モーダル背景を暗く */
    color: #f5f5f5;       /* モーダル内の文字を明るく */
  }

  textarea {
    background-color: #3a3a3a;
    color: #f5f5f5;
    border: 1px solid #666;
  }

  .modal-title-icon-only {
    color: #f5f5f5;
  }

  .tag-area {
    background: #333;
    border-color: #666;
  }

  .tag-button {
    background: #444;
    color: #eee;
    border-color: #666;
  }

  .tag-button.selected {
    background: #567;
    color: #fff;
    border-color: #89a;
  }

  .add-tag-input input {
    background: #444;
    color: #eee;
    border: 1px solid #666;
  }
}

.export-button {
  position: absolute;
  top: 1.0rem;
  right: 1.0rem; /* ← ここを調整 */
  background-color: var(--yamato-primary);
  color: var(--yamato-text-light);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.0rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.export-button:hover {
  background-color: var(--yamato-primary-dark);
}

@media (max-width: 600px) {
  .tag-input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .tag-input-row input,
  .tag-input-row button {
    width: 100%;
  }
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
.selected-icon {
  background-color: white !important;
  color: #274c77 !important;
}


</style>

