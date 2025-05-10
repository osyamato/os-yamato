<template>
  <transition name="fade-modal" appear @after-leave="afterLeave">
    <div v-if="showModal" class="modal-overlay" @click.self="handleClose">
      <div class="modal-inner-card">
        <h3 class="modal-title">Yamato ID で相手を検索</h3>

        <!-- Yamato ID 入力欄 -->
        <input v-model="inputYamatoId" placeholder="@yamato..." @input="addAtMark" />
        <div class="button-row top-spaced">
          <YamatoButton @click="search">検索</YamatoButton>
        </div>

        <!-- 検索結果の表示 -->
        <div v-if="foundProfile" class="profile-preview">
          <p class="profile-name"><strong>名前：</strong>{{ foundProfile.displayName || '未設定' }}</p>
          <p class="profile-bio"><strong>自己紹介：</strong>{{ foundProfile.bio || 'なし' }}</p>
        </div>

        <textarea v-model="requestMessage" placeholder="申請メッセージ（任意）" rows="3" />

        <div class="button-row">
          <YamatoButton @click="sendRequest">チャット申請</YamatoButton>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { listChatRooms, publicProfileByYamatoId } from '@/graphql/queries'
import { updateChatRoom, createChatRequest } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'
import { useRouter } from 'vue-router'

const props = defineProps(['onClose'])
const showModal = ref(true)
const inputYamatoId = ref('')
const foundProfile = ref(null)
const requestMessage = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

function handleClose() {
  showModal.value = false
}
function afterLeave() {
  props.onClose?.()
}

function addAtMark() {
  if (!inputYamatoId.value.startsWith('@')) {
    inputYamatoId.value = '@' + inputYamatoId.value.replace(/^@+/, '')
  }
}

async function search() {
  errorMessage.value = ''
  foundProfile.value = null
  const yamatoId = inputYamatoId.value.trim()

  if (!yamatoId) {
    errorMessage.value = 'Yamato ID を入力してください'
    return
  }

  try {
    const res = await API.graphql({
      query: publicProfileByYamatoId,
      variables: { yamatoId },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })
    const profile = res.data.publicProfileByYamatoId.items[0]
    if (!profile) {
      errorMessage.value = '相手が見つかりませんでした'
      return
    }
    foundProfile.value = profile
  } catch (err) {
    console.error('❌ 検索エラー:', err)
    errorMessage.value = '検索に失敗しました'
  }
}

async function sendRequest() {
  if (!foundProfile.value) return

  try {
    const user = await Auth.currentAuthenticatedUser()
    const mySub = user.attributes.sub
    const partnerSub = foundProfile.value.id

    const res = await API.graphql({
      query: listChatRooms,
      variables: {
        filter: {
          or: [
            { and: [{ user1: { eq: mySub } }, { user2: { eq: partnerSub } }] },
            { and: [{ user1: { eq: partnerSub } }, { user2: { eq: mySub } }] }
          ]
        }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    const existingRoom = res.data.listChatRooms.items[0]
    if (existingRoom) {
      const isUser1 = existingRoom.user1 === mySub
      const deletedKey = isUser1 ? 'deletedByUser1' : 'deletedByUser2'
      if (existingRoom[deletedKey]) {
        await API.graphql({
          query: updateChatRoom,
          variables: { input: { id: existingRoom.id, [deletedKey]: false } },
          authMode: 'AMAZON_COGNITO_USER_POOLS'
        })
      }
      router.push({ name: 'chat', params: { roomId: existingRoom.id, receiverYamatoId: foundProfile.value.yamatoId } })
      showModal.value = false
      return
    }

    const ttl = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60
    await API.graphql({
      query: createChatRequest,
      variables: {
        input: {
          fromUserId: mySub,
          toUserId: partnerSub,
          status: 'pending',
          ttl,
          message: requestMessage.value.trim() || null
        }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    successMessage.value = '✅ チャット申請を送信しました'
    requestMessage.value = ''
    inputYamatoId.value = ''
    foundProfile.value = null
  } catch (err) {
    console.error('❌ 申請エラー:', err)
    errorMessage.value = '申請に失敗しました'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-inner-card {
  background: #fff;
  color: #111;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  animation: dropDown 0.4s ease-out;
}

.modal-title {
  text-align: center;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

input,
textarea {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.button-row {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
.top-spaced {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.profile-preview {
  margin-top: 1rem;
  font-size: 1rem;
  text-align: left;
}

.error,
.success {
  text-align: center;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.error { color: red; }
.success { color: green; }

@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.fade-modal-leave-active {
  animation: flyUp 0.3s ease-in;
}

@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}

@media (prefers-color-scheme: dark) {
  .modal-inner-card {
    background: #1f1f1f;
    color: #f5f5f5;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
  }

  input, textarea {
    background: #3a3a3a;
    color: #f5f5f5;
    border: 1px solid #555;
  }

  input::placeholder,
  textarea::placeholder {
    color: #aaa;
  }

  .error { color: #ff9999; }
  .success { color: #b5ffb5; }
}
</style>

