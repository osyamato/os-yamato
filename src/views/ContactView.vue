]<template>
  <div class="contact-container">
    <!-- 🔵 上部ヘッダー -->
    <div class="contact-header">
      <h2 class="header-title">連絡先</h2>
      <div class="header-icons">
        <button class="icon-circle" @click="openSearchModal">🔍</button>
        <button class="icon-circle" @click="openNewContactModal">＋</button>
      </div>
    </div>

    <!-- 🔵 連絡先一覧 -->
    <div v-if="filteredContacts.length === 0" class="empty-message">
      登録された連絡先がありません
    </div>
    <div v-else class="contact-list">
      <div
        v-for="contact in filteredContacts"
        :key="contact.id"
        class="contact-card"
        @click="openViewModal(contact)"
      >
        <div class="name-with-icon">
          <span class="flower-icon">{{ getLifeStageIcon(contact) }}</span>
          <h3 class="contact-name">{{ contact.name }}</h3>
        </div>
      </div>
    </div>

    <!-- 🔵 閲覧・編集モーダル -->
<Modal :visible="showModal" @close="closeModal">
  <template #default>
    <h3 class="modal-title">
      <span v-if="!isEditMode" class="flower-icon">
        {{ selectedContact ? getLifeStageIcon(selectedContact) : '' }}
      </span>
      {{ isEditMode ? (selectedContact ? '連絡先を編集' : '新しい連絡先を追加') : selectedContact?.name }}
    </h3>

    <div v-if="isEditMode">
      <input v-model="editName" placeholder="名前" />
      <input v-model="editFurigana" placeholder="ふりがな" />
      <input v-model="editPhone" placeholder="電話番号" />
      <input v-model="editEmail" placeholder="メールアドレス" />
      <textarea v-model="editNote" placeholder="メモ"></textarea>
      <input v-model="editYamatoId" placeholder="Yamato ID" />

      <div class="button-row">
        <YamatoButton :disabled="!isFormValid" @click="saveEdit">保存</YamatoButton>
      </div>
    </div>

    <div v-else>
      <div class="modal-body">
        <p v-if="selectedContact?.furigana"><strong>ふりがな:</strong> {{ selectedContact.furigana }}</p>
        <p v-if="selectedContact?.phoneNumbers?.filter(p => p.trim()).length">
          <strong>電話:</strong> {{ selectedContact.phoneNumbers.filter(p => p.trim()).join(', ') }}
        </p>
        <p v-if="selectedContact?.emails?.filter(e => e.trim()).length">
          <strong>メール:</strong> {{ selectedContact.emails.filter(e => e.trim()).join(', ') }}
        </p>
        <p v-if="selectedContact?.note"><strong>メモ:</strong> {{ selectedContact.note }}</p>
        <p v-if="selectedContact?.yamatoId"><strong>Yamato ID:</strong> {{ selectedContact.yamatoId }}</p>
      </div>
      <div class="button-row">
        <YamatoButton @click="startEdit">編集</YamatoButton>
        <YamatoButton type="danger" @click="confirmDelete(selectedContact.id)">削除</YamatoButton>
      </div>
    </div>
  </template>
</Modal>

    <!-- 🔵 検索モーダル -->
<Modal :visible="showSearchModal" @close="closeSearchModal">
  <template #default>
    <h3 class="modal-title">連絡先を検索</h3>
    <input v-model="searchQuery" placeholder="名前またはふりがなで検索" />
    <div class="button-row">
      <YamatoButton @click="closeSearchModal">閉じる</YamatoButton>
    </div>
  </template>
</Modal>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { createContact, updateContact, deleteContact } from '@/graphql/mutations'
import { listContacts } from '@/graphql/queries'
import YamatoButton from '@/components/YamatoButton.vue'
import Modal from '@/components/Modal.vue'

// --- データ ---
const contacts = ref([])
const showModal = ref(false)
const showSearchModal = ref(false)
const isEditMode = ref(false)
const selectedContact = ref(null)
const searchQuery = ref('')

// --- フォーム用 ---
const editName = ref('')
const editFurigana = ref('')
const editPhone = ref('')
const editEmail = ref('')
const editNote = ref('')
const editYamatoId = ref('')
const isFormValid = computed(() => {
  return editName.value.trim() !== '' || editPhone.value.trim() !== '' || editEmail.value.trim() !== ''
})


// --- フィルタリング ---
const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value
  const keyword = searchQuery.value.toLowerCase()
  return contacts.value.filter(contact =>
    (contact.name && contact.name.toLowerCase().includes(keyword)) ||
    (contact.furigana && contact.furigana.toLowerCase().includes(keyword))
  )
})

// --- 連絡先一覧取得 ---
async function fetchContacts() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const res = await API.graphql(graphqlOperation(listContacts, {
      filter: { owner: { eq: user.username } }
    }))

    const now = new Date()
    const items = res.data.listContacts.items.filter(item => item)

    // 古いデータを削除する
    for (const contact of items) {
      const updated = new Date(contact.updatedAt || contact.createdAt)
      const diffDays = (now - updated) / (1000 * 60 * 60 * 24)

      if (diffDays > 365) {
        console.log(`🛑 削除対象: ${contact.name} (${diffDays.toFixed(1)}日経過)`)
        try {
          await API.graphql(graphqlOperation(deleteContact, { input: { id: contact.id } }))
          console.log(`✅ ${contact.name} を削除しました`)
        } catch (err) {
          console.error(`❌ ${contact.name} の削除に失敗`, err)
        }
      }
    }

    // 残ったデータだけで一覧を再構築
    contacts.value = items
      .filter(contact => {
        const updated = new Date(contact.updatedAt || contact.createdAt)
        const diffDays = (now - updated) / (1000 * 60 * 60 * 24)
        return diffDays <= 365
      })
      .sort((a, b) => {
        const aFurigana = a.furigana || 'んんん'
        const bFurigana = b.furigana || 'んんん'
        return aFurigana.localeCompare(bFurigana, 'ja')
      })

  } catch (e) {
    console.error('fetchContacts error:', e)
  }
}

// --- 閲覧モーダル ---
async function openViewModal(contact) {
  selectedContact.value = contact
  isEditMode.value = false
  showModal.value = true

  try {
    await API.graphql(graphqlOperation(updateContact, { input: { id: contact.id } }))
    console.log(`✅ updatedAt 更新: ${contact.name}`)
    await fetchContacts()
  } catch (e) {
    console.error('updatedAt更新エラー:', e)
  }
}

// --- 新規登録モーダル ---
function openNewContactModal() {
  selectedContact.value = null
  isEditMode.value = true
  resetForm()
  showModal.value = true
}

// --- 検索モーダル ---
function openSearchModal() {
  showSearchModal.value = true
}

function closeSearchModal() {
  showSearchModal.value = false
  // searchQuery.value = '' // ←必要ならリセット
}

// --- 閉じる ---
function closeModal() {
  showModal.value = false
  isEditMode.value = false
}

// --- 編集開始 ---
function startEdit() {
  if (!selectedContact.value) return
  isEditMode.value = true
  editName.value = selectedContact.value.name
  editFurigana.value = selectedContact.value.furigana || ''
  editPhone.value = selectedContact.value.phoneNumbers?.[0] || ''
  editEmail.value = selectedContact.value.emails?.[0] || ''
  editNote.value = selectedContact.value.note || ''
  editYamatoId.value = selectedContact.value.yamatoId || ''
}

// --- フォームリセット ---
function resetForm() {
  editName.value = ''
  editFurigana.value = ''
  editPhone.value = ''
  editEmail.value = ''
  editNote.value = ''
  editYamatoId.value = ''
}

// --- 保存（新規 or 更新）---
async function saveEdit() {
  try {
    const user = await Auth.currentAuthenticatedUser()

    const input = {
      name: editName.value,
      furigana: editFurigana.value,
      phoneNumbers: [editPhone.value],
      emails: [editEmail.value],
      note: editNote.value,
      yamatoId: editYamatoId.value,
      owner: user.username,
    }

    if (selectedContact.value) {
      input.id = selectedContact.value.id
      await API.graphql(graphqlOperation(updateContact, { input }))
      console.log('✅ 連絡先 更新成功')
    } else {
      await API.graphql(graphqlOperation(createContact, { input }))
      console.log('✅ 連絡先 新規作成成功')
    }

    await fetchContacts()
    closeModal()
  } catch (e) {
    console.error('保存エラー:', e)
  }
}

// --- 削除処理 ---
async function confirmDelete(id) {
  if (!id) return
  if (confirm('本当に削除しますか？')) {
    await deleteContactItem(id)
    closeModal()
  }
}

async function deleteContactItem(id) {
  try {
    await API.graphql(graphqlOperation(deleteContact, { input: { id } }))
    console.log('✅ 連絡先 削除成功')
    await fetchContacts()
  } catch (e) {
    console.error('削除エラー:', e)
  }
}

// --- 芽アイコン判定 🌱🌷🥀 ---
function getLifeStageIcon(contact) {
  const now = new Date()
  const baseDate = contact.updatedAt ? new Date(contact.updatedAt) : new Date(contact.createdAt)
  const baseDateOnly = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = (nowDateOnly - baseDateOnly) / (1000 * 60 * 60 * 24)

  if (diffDays < 180) return '🌱'
  else if (diffDays < 330) return '🌷'
  else return '🥀'
}

// --- 初期ロード ---
onMounted(fetchContacts)

</script>

<style scoped>
/* 🌸 全体レイアウト */
.contact-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
  animation: dropDown 0.6s ease-out;
  width: 100%;
  max-width: 960px; /* ✅ これを追加：コンテンツの幅を制限 */
  margin: 0 auto;    /* ✅ 本体ごと中央に */
}

/* 🌸 ヘッダー */
.contact-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  max-width: 600px;            /* ✅ これを追加 */
  margin-left: auto;           /* ✅ 中央揃え */
  margin-right: auto;          /* ✅ 中央揃え */
  gap: 1rem;
  margin-bottom: 2rem;
}

.contact-list {
  width: 100%;
  max-width: 600px;
  margin-left: auto;           /* ✅ 中央揃え */
  margin-right: auto;          /* ✅ 中央揃え */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-title {
  font-size: 1.5rem;
  color: #274c77;
  font-weight: bold;
  font-family: serif;
  text-align: center; /* ✅ これも補強 */
  width: 100%;         /* ✅ 中央寄せを安定させる */
}
.header-icons {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  align-items: center;
}
.icon-circle {
  background-color: #333;
  border: none;
  border-radius: 50%;
  color: white;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: opacity 0.3s;
}
.icon-circle:hover {
  opacity: 0.8;
}


.contact-card {
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
  justify-content: center;
  margin-bottom: 0.3rem;
}
.flower-icon {
  font-size: 1.2rem;
  margin-right: 0.4rem;
  vertical-align: middle;
}
.contact-name {
  font-size: 1rem;
  font-weight: normal;
}

.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 🌸 内側のカード */
.modal-inner-card {
  background: #fff;
  color: #111;
  border-radius: 14px;
  padding: 2rem 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;

  /* 👇 追加で中央化 */
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 🌸 タイトル */
.modal-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: normal;
  margin-bottom: 1.2rem;
}
.modal-inner-card.naked {
  max-width: 640px; /* ✅ ここを任意の幅に変更 */
  width: 90vw;       /* スマホでも自然に広がるように */
}

/* 🌸 本文 */
.modal-body p {
  font-size: 1rem;
  margin-bottom: 0.8rem;
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
}
textarea {
  min-height: 100px;
  resize: vertical;
}


/* 🌸 ボタン群 */
.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 🌸 アニメーション */
@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
.modal-enter-active {
  animation: dropDown 0.4s ease-out;
}
.modal-leave-active {
  animation: flyUp 0.3s ease-in;
}

/* 🌙 ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .modal-inner-card {
    background: #1f1f1f;
    color: #f5f5f5;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
  }
  input,
  textarea {
    background: #3a3a3a;
    color: #f5f5f5;
    border-color: #555;
  }
  input::placeholder,
  textarea::placeholder {
    color: #aaa;
  }
  .contact-card {
    background: #2c2c2c;
    color: #f5f5f5;
    border-bottom: 1px solid #555;
  }
  .contact-name {
    color: #f5f5f5;
  }
  .flower-icon {
    color: #a5d6a7;
  }
  .icon-circle {
    background-color: #444;
  }
}
</style>



