<template>
  <div class="template-view drop-down-animation">
    <h2 class="header-title">{{ t('template.header') }}</h2>

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

    <!-- ゴミ箱 -->
    <div class="selection-actions" v-if="isSelectionMode">
      <IconButton :color="iconColor" size="medium" @click="promptBulkDelete">🗑️</IconButton>
    </div>

    <!-- テンプレート一覧 -->
    <div class="template-list">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        class="template-card"
        :class="{ selected: isSelectionMode && selectedTemplateIds.includes(tpl.id) }"
        @click="isSelectionMode ? toggleTemplateSelection(tpl.id) : openTemplateModal(tpl)"
      >
        <input
          type="checkbox"
          v-if="isSelectionMode"
          :checked="selectedTemplateIds.includes(tpl.id)"
          @click.stop
          @change="toggleTemplateSelection(tpl.id)"
        />
        <span class="template-emoji">{{ tpl.emoji }}</span>
        <span class="template-label">{{ tpl.label }}</span>
        <span class="template-time">
          {{ tpl.isAllDay ? t('calendar.allDay') : `${tpl.startTime} - ${tpl.endTime}` }}
        </span>
      </div>
    </div>

    <!-- 作成モーダル -->
    <Modal :visible="showModal" customClass="compact" @close="showModal = false">
      <h3 class="modal-title">{{ t('template.create') }}</h3>
      <input v-model="newTemplate.emoji" :placeholder="t('template.emojiPlaceholder')" class="input-field" />
      <div class="emoji-options">
        <span
          v-for="emoji in emojiSamples"
          :key="emoji"
          class="emoji-button"
          @click="newTemplate.emoji = emoji"
        >{{ emoji }}</span>
      </div>
      <input v-model="newTemplate.label" :placeholder="t('template.labelPlaceholder')" class="input-field" />
      <div class="time-row" v-if="!newTemplate.isAllDay">
        <input type="time" v-model="newTemplate.startTime" class="time-input" />
        <input type="time" v-model="newTemplate.endTime" class="time-input" />
      </div>
      <label class="all-day-toggle">
        <input type="checkbox" v-model="newTemplate.isAllDay" />
        {{ t('calendar.allDay') }}
      </label>
      <div class="button-row">
        <YamatoButton @click="createTemplate">{{ t('add') }}</YamatoButton>
      </div>
    </Modal>

    <!-- 編集モーダル -->
    <Modal :visible="!!selectedTemplate" customClass="compact" @close="selectedTemplate = null">
      <template #default>
        <div v-if="selectedTemplate">
          <h3 class="modal-title">{{ t('template.edit') }}</h3>
          <input v-model="selectedTemplate.emoji" :placeholder="t('template.emojiPlaceholder')" class="input-field" />
          <input v-model="selectedTemplate.label" class="input-field" :placeholder="t('template.labelPlaceholder')" />
          <div class="time-row" v-if="!selectedTemplate.isAllDay">
            <input type="time" v-model="selectedTemplate.startTime" class="time-input" />
            <input type="time" v-model="selectedTemplate.endTime" class="time-input" />
          </div>
          <label class="all-day-toggle">
            <input type="checkbox" v-model="selectedTemplate.isAllDay" />
            {{ t('calendar.allDay') }}
          </label>
          <div class="button-row">
            <YamatoButton @click="updateTemplate">{{ t('update') }}</YamatoButton>
            <YamatoButton type="danger" @click="promptSingleDelete(selectedTemplate.id)">
              {{ t('delete') }}
            </YamatoButton>
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
import { createScheduleTemplate, deleteScheduleTemplate, updateScheduleTemplate } from '@/graphql/mutations'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

const newTemplate = ref({
  emoji: '',
  label: '',
  startTime: '',
  endTime: '',
  isAllDay: false
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
  } catch (e) {
    console.error('❌ テンプレート削除失敗:', e)
  } finally {
    showConfirm.value = false
    pendingDeleteIds.value = []
  }
}

function openCreateModal() {
  const now = new Date()

  // 現在時刻の「切り捨てた時間（例: 8:00）」を取得
  const startHour = now.getHours()
  const startTime = `${String(startHour).padStart(2, '0')}:00`

  // 終了時刻は1時間後（23時なら24:00→00:00に）
  const endHour = (startHour + 1) % 24
  const endTime = `${String(endHour).padStart(2, '0')}:00`

  newTemplate.value = {
    emoji: '',
    label: '',
    startTime,
    endTime,
    isAllDay: false
  }
  showModal.value = true
}

async function createTemplate() {
  const input = { ...newTemplate.value }
  if (input.isAllDay) {
    input.startTime = null
    input.endTime = null
  } else if (!input.startTime || !input.endTime) {
    alert('開始と終了時間は必須です')
    return
  }

  await API.graphql(graphqlOperation(createScheduleTemplate, { input }))
  showModal.value = false
  newTemplate.value = { emoji: '', label: '', startTime: '', endTime: '', isAllDay: false }
  fetchTemplates()
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

function openTemplateModal(t) {
  selectedTemplate.value = {
    id: t.id,
    emoji: t.emoji || '',
    label: t.label || '',
    startTime: t.startTime ?? '',
    endTime: t.endTime ?? '',
    isAllDay: t.isAllDay || false
  }
}

async function updateTemplate() {
  if (!selectedTemplate.value) return

  const input = { ...selectedTemplate.value }
  if (input.isAllDay) {
    input.startTime = null
    input.endTime = null
  }

  await API.graphql(graphqlOperation(updateScheduleTemplate, { input }))
  selectedTemplate.value = null
  fetchTemplates()
}

async function fetchTemplates() {
  const result = await API.graphql(graphqlOperation(listScheduleTemplates))
  templates.value = result.data.listScheduleTemplates.items
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
  background: white;
  margin-bottom: 0.4rem;
  border-bottom: 1px solid #ccc;
  border-radius: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
  color: #000;
  cursor: pointer;
  transition: background-color 0.3s ease;

  width: 330px;     /* 📏 固定幅 */
  height: 80px;     /* 📏 固定高さ */
  box-sizing: border-box;
  word-wrap: break-word;
  overflow: hidden;
}

@media (min-width: 768px) {
  .template-card {
    width: 400px; /* 📱 タブレット幅 */
  }
}

@media (min-width: 1024px) {
  .template-card {
    width: 480px; /* 💻 PC幅 */
  }
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
.all-day-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem auto;
  font-size: 0.95rem;
  color: #000;
}

@media (prefers-color-scheme: dark) {
  .all-day-toggle {
    color: #fff;
  }
}


</style>
