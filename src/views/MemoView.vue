<template>
  <div class="memo-container">
    <!-- ヘッダー -->
    <div class="memo-header">
 <h2 class="header-title">{{ t('memoTitle') }}</h2>

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
<IconButton :color="iconColor" @click="requestBulkDelete">🗑</IconButton>
</div>
    </div>

    <!-- 🥀 詩的メッセージ -->
 <p v-if="filterWiltingOnly" class="wilted-message">
      {{ t('message.memoryFlower') }}
    </p>

    <!-- メモ一覧 -->
    <div v-if="filteredMemos.length > 0" class="memo-list">
<div
  v-for="(memo, index) in filteredMemos"
  :key="memo.id"
  class="memo-card fade-item"
  :style="{ animationDelay: `${index * 50}ms` }"
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
  {{ t('created') }}: {{ formatDate(memo.createdAt) }}
  <span
    v-if="memo.createdAt && memo.updatedAt && !isSameDay(memo.createdAt, memo.updatedAt)"
  >
    ／ {{ t('updated') }}: {{ formatDate(memo.updatedAt) }}
  </span>
        </div>
      </div>
    </div>

    <!-- ✅ 新規・編集モーダル -->
    <transition name="modal">
<Modal v-if="showModal" :visible="showModal" @close="closeModal" customClass="wide-modal">
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
  :placeholder="selectedMemo ? t('editPlaceholder') : t('newPlaceholder')"
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
  <input
    type="text"
    :placeholder="t('tagInputPlaceholder')"
    v-model="newTagInput"
  />
  <YamatoButton @click="addTag">{{ t('add') }}</YamatoButton>
</div>
        </div>

        <div class="button-row">
<YamatoButton
  v-if="selectedMemo"
  size="small"
  :disabled="editMemoContent.trim().length === 0"
  @click="updateSelectedMemo"
>
  {{ t('update') }}
</YamatoButton>

<YamatoButton
  v-if="selectedMemo"
  size="small"
  type="danger"
  @click="promptDeleteMemo"
>
  {{ t('delete') }}
</YamatoButton>
<YamatoButton
  v-else
  size="small"
  :disabled="newMemoContent.trim().length === 0"
  @click="saveMemo"
>
  {{ t('save') }}
</YamatoButton>
        </div>
      </Modal>
    </transition>

    <!-- 🔍 タグ検索モーダル -->
    <transition name="modal">
<Modal v-if="showSearchModal" :visible="showSearchModal" @close="closeSearchModal" customClass="compact">
 <h3 class="modal-title">{{ t('searchByTag') }}</h3>
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
<YamatoButton @click="clearSearchTag">{{ t('showAll') }}</YamatoButton>
        </div>
      </Modal>

    </transition>

<ConfirmDialog
  v-if="showConfirm"
  :visible="showConfirm"
  :message="t('confirmDeleteSingle')"
  @confirm="handleConfirmedDelete"
  @cancel="showConfirm = false"
/>

<ConfirmDialog
  v-if="showConfirmBulkDelete"
  :visible="showConfirmBulkDelete"
  :message="t('confirmDeleteBulk')"
  @confirm="handleBulkDeleteConfirmed"
  @cancel="showConfirmBulkDelete = false"
/>

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
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useI18n } from 'vue-i18n'
import { i18n } from '@/i18n'

const { t } = useI18n()


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
  const locale = i18n.global.locale.value
  return date.toLocaleDateString(locale, {
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
    alert(t('memo.exportEmptyWarning'))
    return
  }

  const content = selected.map(memo => {
    const created = formatDate(memo.createdAt)
    const updated = formatDate(memo.updatedAt)
    const tags = memo.tags?.join(', ') || ''
    return `---\n作成: ${created}${created !== updated ? ` ／ 更新: ${updated}` : ''}\nタグ: ${tags}\n\n${memo.content}`
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
    openNewMemoModal(reader.result)
  }
  reader.readAsText(file)
} else {
  alert(t('memo.uploadInvalidFormat'))  // ← ローカライズ
}
}

// --- メモ取得 ---
async function fetchMemos() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub

    const result = await API.graphql(graphqlOperation(listMemos, {
      filter: { owner: { contains: sub } }
    }))

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
      } catch (err) {
        // 削除エラーは無視または必要ならUI通知
      }
    }

    memos.value = filtered.sort((a, b) => {
      const dateA = new Date(b.updatedAt || b.createdAt)
      const dateB = new Date(a.updatedAt || a.createdAt)
      return dateA - dateB
    })

    if (selectedMemo.value?.id) {
      const matched = filtered.find(m => m.id === selectedMemo.value.id)
      selectedMemo.value = matched || null
    }

    const tagsSet = new Set()
    filtered.forEach(m => (m.tags || []).forEach(tag => tagsSet.add(tag)))
    allTags.value = Array.from(tagsSet)

  } catch (err) {
    // 必要なら UI 表示用に変える
  }
}

async function deleteSelectedMemo() {
  if (!selectedMemo.value) return

  const confirmed = confirm(t('memo.confirmDeleteSingle'))
  if (!confirmed) return

  try {
    await API.graphql(graphqlOperation(deleteMemo, {
      input: { id: selectedMemo.value.id }
    }))
    closeModal()
    await fetchMemos()
  } catch (err) {
    console.error('❌ メモ削除失敗:', err)
  }
}

async function deleteSelectedMemos() {
  if (selectedMemoIds.value.length === 0) {
    alert(t('memo.deleteEmptyWarning'))
    return
  }

  const confirmed = confirm(t('memo.confirmDeleteMultiple', { count: selectedMemoIds.value.length }))
  if (!confirmed) return

  for (const id of selectedMemoIds.value) {
    try {
      await API.graphql(graphqlOperation(deleteMemo, { input: { id } }))
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
        tags: selectedTags.value,
        sharedWith: [] // ← 🔁 現時点では空配列でOK。将来的にUIから設定可能に
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
        tags: selectedTags.value,
        sharedWith: selectedMemo.value.sharedWith || [] // ← 🔁 ここを追加（null対策も含む）
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
  console.log(`[MemoView] openEditMemoModal called. iconColor=${iconColor.value}`)
  selectedMemo.value = memo
  editMemoContent.value = memo.content
  selectedTags.value = memo.tags ? [...memo.tags] : []
  isEditMode.value = true
  showTagArea.value = false
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

const showConfirm = ref(false)
const showConfirmBulkDelete = ref(false)

function promptDeleteMemo() {
  if (!selectedMemo.value) return
  showConfirm.value = true
}

async function handleConfirmedDelete() {
  try {
    await API.graphql(graphqlOperation(deleteMemo, {
      input: { id: selectedMemo.value.id }
    }))
    console.log('✅ 削除成功')
    showConfirm.value = false
    closeModal()
    await fetchMemos()
  } catch (e) {
    console.error('❌ 削除失敗:', e)
    showConfirm.value = false
  }
}
function requestBulkDelete() {
  if (selectedMemoIds.value.length === 0) {
    alert('⚠️ 削除するメモが選択されていません')
    return
  }
  showConfirmBulkDelete.value = true
}
async function handleBulkDeleteConfirmed() {
  try {
    for (const id of selectedMemoIds.value) {
      await API.graphql(graphqlOperation(deleteMemo, { input: { id } }))
    }
    selectedMemoIds.value = []
    await fetchMemos()
  } catch (err) {
    console.error('❌ 一括削除失敗:', err)
  } finally {
    showConfirmBulkDelete.value = false
  }
}

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

margin-bottom: 0.6rem; 
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
margin-top: 0; 
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


.flower-icon {
  font-size: 1.2rem;
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

.modal-inner-card.wide-modal {
  width: 95vw;             /* ✅ ← PCでは幅を画面の95%に拡張 */
  max-width: 880px;
  max-height: 92vh;
  padding: 2.2rem;
}

@media (max-width: 1023px) {
  .modal-inner-card.wide-modal {
    width: 90%;            /* モバイルでは90%のまま */
    max-width: 600px;
    max-height: 85vh;
    padding: 1.6rem;
  }
}

.modal-title-icon-only {
  color: #111; /* ← ライトモード用：黒文字にする */
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-title {
  color: #111; /* ← ライトモード用の黒文字 */
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
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
font-size: 16px; 
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
  font-size: 16px; 
  border: 1px solid #ccc;
  border-radius: 6px;
}

.empty-message {
  margin-top: 2rem;
  color: #888;
  font-size: 1.1rem;
}

.memo-list {
  margin: 1rem 1rem 0;
  opacity: 0;
  animation: fadeInMemoList 0.3s ease-out forwards;
  animation-delay: 150ms; /* ← 必要に応じて短く調整OK */
}
@keyframes fadeInMemoList {
  from {
    opacity: 0;
    transform: translateY(-6px); /* 🔽 上から下に降りる */
  }
  to {
    opacity: 1;
    transform: translateY(0);    /* 🎯 元の位置 */
  }
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
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;           /* ← 3行まで表示 */
  -webkit-box-orient: vertical;
  color: #000;
  margin-left: 2rem;
}


.memo-card {
  position: relative;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.3rem;
  background: #fdfdfd; /* ほんのり柔らかい白に変更 */
  border: 1px solid #bbb; /* 枠線追加で浮かせ感 */
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.9rem;
  color: #000;
  cursor: pointer;

  width: 330px;
  height: 90px;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow: hidden;

  /* ✅ 柔らかい影で立体感を演出 */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 10px rgba(0, 0, 0, 0.1);
}


.memo-dates {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.2rem;
  text-align: right;
}
@media (min-width: 768px) {
  .memo-card {
    width: 400px; /* タブレットで広めに */
  }
}

@media (min-width: 1024px) {
  .memo-card {
    width: 480px; /* PCでさらに広く */
  }
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
    background: #2c2c2c;
    color: #f5f5f5;
    border: 1px solid transparent; /* ✅ 見えないがレイアウト維持用 */
    box-shadow: none; /* ← 陰影もなしにするなら */
  }

  .memo-content {
    color: #f5f5f5; /* 明るめに */
  }

  .memo-dates {
    color: #bbb; /* 日付はやや淡く */
  }
}

@media (prefers-color-scheme: dark) {
  .modal-inner-card {
    background: #2c2c2c; /* モーダル背景を暗く */
    color: #f5f5f5;	  /* モーダル内の文字を明るく */
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

.fade-item {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.35s ease-out forwards;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
