<template>
  <div class="template-view drop-down-animation">
    <h2 class="header-title">スケジュールテンプレート</h2>

    <!-- アイコン群 -->
    <div class="header-icons">
      <IconButton :color="iconColor" size="medium" @click="openCreateModal">＋</IconButton>
      <IconButton
        :color="iconColor"
        size="medium"
        :class="{ 'selected-icon': isSelectionMode }"
        @click="toggleSelectionMode"
      >☑️</IconButton>
    </div>

    <!-- ✅ 選択モード時：ゴミ箱 -->
    <div class="selection-actions" v-if="isSelectionMode">
      <IconButton :color="iconColor" size="medium" @click="promptBulkDelete">🗑️</IconButton>
    </div>

    <!-- テンプレート一覧 -->
    <div class="template-list">
      <div
        v-for="t in templates"
        :key="t.id"
        class="template-card"
        :class="{ selected: isSelectionMode && selectedTemplateIds.includes(t.id) }"
        @click="isSelectionMode ? toggleTemplateSelection(t.id) : openTemplateModal(t)"
      >
        <input
          type="checkbox"
          v-if="isSelectionMode"
          :checked="selectedTemplateIds.includes(t.id)"
          @click.stop
          @change="toggleTemplateSelection(t.id)"
        />
        <span class="template-emoji">{{ t.emoji }}</span>
        <span class="template-label">{{ t.label }}</span>
        <span class="template-time">{{ t.startTime }} - {{ t.endTime }}</span>
      </div>
    </div>

    <!-- 作成モーダル -->
    <Modal :visible="showModal" @close="showModal = false">
      <h3 class="modal-title">テンプレートを作成</h3>
      <input v-model="newTemplate.emoji" placeholder="絵文字 (例: 📚)" class="input-field" />
      <div class="emoji-options">
        <span
          v-for="emoji in emojiSamples"
          :key="emoji"
          class="emoji-button"
          @click="newTemplate.emoji = emoji"
        >
          {{ emoji }}
        </span>
      </div>
      <input v-model="newTemplate.label" placeholder="タイトル (例: 日勤)" class="input-field" />
      <div class="time-row">
        <input type="time" v-model="newTemplate.startTime" class="time-input" />
        <input type="time" v-model="newTemplate.endTime" class="time-input" />
      </div>
      <div class="button-row">
        <YamatoButton @click="createTemplate">登録</YamatoButton>
      </div>
    </Modal>

    <!-- 編集モーダル -->
    <Modal :visible="!!selectedTemplate" @close="selectedTemplate = null">
      <template #default>
        <div v-if="selectedTemplate">
          <h3 class="modal-title">テンプレート編集</h3>
          <input v-model="selectedTemplate.emoji" class="input-field" placeholder="絵文字" />
          <input v-model="selectedTemplate.label" class="input-field" placeholder="タイトル" />
          <div class="time-row">
            <input type="time" v-model="selectedTemplate.startTime" class="time-input" />
            <input type="time" v-model="selectedTemplate.endTime" class="time-input" />
          </div>
          <div class="button-row">
            <YamatoButton @click="updateTemplate">更新</YamatoButton>
            <YamatoButton type="danger" @click="promptSingleDelete(selectedTemplate.id)">削除</YamatoButton>
          </div>
        </div>
      </template>
    </Modal>

    <!-- 削除確認 -->
    <ConfirmDialog
      v-if="showConfirm"
      :visible="showConfirm"
      :message="confirmMessage"
      @confirm="handleConfirmedDelete"
      @cancel="() => { showConfirm = false; pendingDeleteIds = [] }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { listScheduleTemplates } from '@/graphql/queries'
import {
  createScheduleTemplate,
  deleteScheduleTemplate,
  updateScheduleTemplate
} from '@/graphql/mutations'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'
import { Auth } from 'aws-amplify'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const iconColor = ref('#274c77')

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
})

// ステート定義
const templates = ref([])
const showModal = ref(false)
const isSelectionMode = ref(false)
const selectedTemplateIds = ref([])
const selectedTemplate = ref(null)

const emojiSamples = ['❤️', '🏥', '🧘', '🏃', '📚', '🍖', '🐾', '🐈', '🐕', '🛒', '㊙', '⛰️', '🌙']

// 初期値は空。＋を押すと openCreateModal() でセットされる
const newTemplate = ref({
  emoji: '',
  label: '',
  startTime: '',
  endTime: ''
})

const showConfirm = ref(false)
const pendingDeleteIds = ref([])
const confirmMessage = ref('')

function promptSingleDelete(id) {
  pendingDeleteIds.value = [id]
  confirmMessage.value = 'このテンプレートを削除しますか？'
  showConfirm.value = true
}

function promptBulkDelete() {
  if (selectedTemplateIds.value.length === 0) return
  pendingDeleteIds.value = [...selectedTemplateIds.value]
  confirmMessage.value = '選択したテンプレートを削除しますか？'
  showConfirm.value = true
}
async function handleConfirmedDelete() {
  try {
    for (const id of pendingDeleteIds.value) {
      await API.graphql(graphqlOperation(deleteScheduleTemplate, { input: { id } }))
    }
    await fetchTemplates()
    selectedTemplateIds.value = []
    selectedTemplate.value = null
    isSelectionMode.value = false
    console.log('✅ テンプレート削除完了')
  } catch (e) {
    console.error('❌ テンプレート削除失敗:', e)
  } finally {
    showConfirm.value = false
    pendingDeleteIds.value = []
  }
}


function openCreateModal() {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  const hour = now.getHours()
  const start = `${pad(hour)}:00`
  const end = `${pad((hour + 1) % 24)}:00`

  newTemplate.value = {
    emoji: '',
    label: '',
    startTime: start,
    endTime: end
  }

  showModal.value = true
}

async function fetchTemplates() {
  const result = await API.graphql(graphqlOperation(listScheduleTemplates))
  templates.value = result.data.listScheduleTemplates.items
}

function toggleSelectionMode() {
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) selectedTemplateIds.value = []
}

function toggleTemplateSelection(id) {
  const exists = selectedTemplateIds.value.includes(id)
  if (exists) {
    selectedTemplateIds.value = selectedTemplateIds.value.filter(i => i !== id)
  } else {
    selectedTemplateIds.value.push(id)
  }
}


async function createTemplate() {
  if (!newTemplate.value.startTime || !newTemplate.value.endTime) {
    alert('開始と終了時間は必須です')
    return
  }

  await API.graphql(graphqlOperation(createScheduleTemplate, {
    input: { ...newTemplate.value }
  }))

  showModal.value = false
  newTemplate.value = { emoji: '', label: '', startTime: '', endTime: '' }
  fetchTemplates()
}

async function updateTemplate() {
  if (!selectedTemplate.value) return

  await API.graphql(graphqlOperation(updateScheduleTemplate, {
    input: { ...selectedTemplate.value }
  }))

  selectedTemplate.value = null
  fetchTemplates()
}

async function deleteTemplate(id) {
  if (!confirm('本当に削除しますか？')) return

  await API.graphql(graphqlOperation(deleteScheduleTemplate, { input: { id } }))
  selectedTemplate.value = null
  fetchTemplates()
}

async function deleteSelectedTemplates() {
  const confirmed = confirm('選択したテンプレートを削除しますか？')
  if (!confirmed) return

  for (const id of selectedTemplateIds.value) {
    await API.graphql(graphqlOperation(deleteScheduleTemplate, { input: { id } }))
  }

  selectedTemplateIds.value = []
  isSelectionMode.value = false
  fetchTemplates()
}
function openTemplateModal(t) {
  selectedTemplate.value = {
    id: t.id,
    emoji: t.emoji || '',
    label: t.label || '',
    startTime: t.startTime || '12:00',
    endTime: t.endTime || '13:00'
  }
}

function openScheduleFromTemplate(template) {
  prefillSchedule.value = {
    emoji: template.emoji,
    label: template.label,
    startTime: template.startTime,
    endTime: template.endTime,
    date: selectedDate.value // 例えばカレンダーで選択中の日
  }
  showScheduleModal.value = true
}

onMounted(fetchTemplates)
</script>


<style scoped>
.template-view {
  padding: 1rem;
  text-align: center;
}
.header-title {
  font-size: 1.4rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem; /* 👈 タイトル下に余白を追加 */
}

@media (prefers-color-scheme: dark) {
  .header-title {
    color: #fff;
  }
}
.header-icons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}


.bulk-delete {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.bulk-delete-button {
  background-color: var(--yamato-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
.selection-actions {
  display: flex;
  justify-content: center; /* ← 中央に配置 */
  margin: 1rem 0;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.template-card {
  position: relative;
  padding: 0.6rem 0.8rem;
  background: white; /* 💡 ライトモード用 */
  margin-bottom: 0.4rem;
  border-bottom: 1px solid #ccc;
  border-radius: 6px;
  display: flex;
  flex-direction: row; /* 横並び */
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
  color: #000;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.input-field {
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  font-size: 16px;           /* 🔑 iPhoneでズームさせない */
  border: 1px solid #ccc;
  border-radius: 10px;
  margin: 0.5rem auto;
  display: block;
  box-sizing: border-box;
}
.time-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 1rem 0;
  gap: 0.5rem;
}

.time-input {
  padding: 1rem;
  font-size: 1.3rem;
  width: 140px;
  border: none;
  border-radius: 12px;
  background-color: #f0f0f0;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.button-row {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.emoji-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.5rem auto 1rem;
  max-width: 400px;
}

.emoji-button {
  font-size: 1.0rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: background 0.2s;
}
.emoji-button:hover {
  background: #e0e0e0;
}

/* 🌞 ライトモード（デフォルト） */
.emoji-button {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1.2rem; /* ← 🔽 小さめに */
  padding: 0.3rem 0.5rem; /* ← 🔽 少し詰める */
  margin: 0.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.emoji-button:hover {
  background-color: #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .template-card {
    background-color: #2c2c2c;
    color: #fff;
  }

  .input-field {
    background-color: #2e2e2e !important;
    color: #fff !important;
    border: 1px solid #444 !important;
  }

  .input-field::placeholder {
    color: #aaa !important;
  }

  .emoji-button {
    background-color: #3a3a3a !important;
    color: #fff !important;
    border: 1px solid #555;
  }

  .emoji-button:hover {
    background-color: #444 !important;
  }

  .time-input {
    background-color: #2e2e2e !important;
    color: #fff !important;
    border: 1px solid #555;
  }
}

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

.drop-down-animation {
  animation: dropDown 0.5s ease-out;
}
</style>
