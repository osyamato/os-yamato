<template>
  <transition name="fade-modal" appear @after-leave="afterLeave">
    <div v-if="showModal" class="modal-overlay" @click.self="handleClose">
      <div class="modal-inner-card">
        <h3 class="modal-title">Yamato ID で相手を検索</h3>

        <!-- Yamato ID 入力欄 -->
        <input
          v-model="inputYamatoId"
          placeholder="@yamato..."
          @input="addAtMark"
        />
        <div class="button-row top-spaced">
          <YamatoButton @click="search">検索</YamatoButton>
        </div>

        <!-- 検索結果の表示 -->
        <div class="profile-results" v-if="foundProfiles.length > 0">
          <div
            v-for="profile in foundProfiles"
            :key="profile.id"
            class="profile-preview"
          >
            <p class="profile-name"><strong>名前：</strong>{{ profile.displayName || '未設定' }}</p>
            <p class="profile-bio"><strong>自己紹介：</strong>{{ profile.bio || 'なし' }}</p>
            <YamatoButton @click="sendRequest(profile)">この人に申請</YamatoButton>
          </div>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { listChatRooms, publicProfileByYamatoId } from '@/graphql/queries'
import { updateChatRoom, createChatRequest } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  onClose: Function,
  initialYamatoId: String
})

const showModal = ref(true)
const inputYamatoId = ref('')
const foundProfiles = ref([])
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

function handleClose() {
  showModal.value = false
}

function afterLeave() {
  if (typeof props.onClose === 'function') props.onClose()
}

function addAtMark() {
  if (!inputYamatoId.value.startsWith('@')) {
    inputYamatoId.value = '@' + inputYamatoId.value.replace(/^@+/, '')
  }
}

async function search() {
  errorMessage.value = ''
  foundProfiles.value = []
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
    foundProfiles.value = res.data.publicProfileByYamatoId.items
    if (foundProfiles.value.length === 0) {
      errorMessage.value = '相手が見つかりませんでした'
    }
  } catch (err) {
    console.error('❌ 検索エラー:', err)
    errorMessage.value = '検索に失敗しました'
  }
}

async function sendRequest(profile) {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const mySub = user.attributes.sub
    const partnerSub = profile.id

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
      router.push({ name: 'chat', params: { roomId: existingRoom.id, receiverYamatoId: profile.yamatoId } })
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
          message: null
        }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    successMessage.value = '✅ チャット申請を送信しました'
    inputYamatoId.value = ''
    foundProfiles.value = []
  } catch (err) {
    console.error('❌ 申請エラー:', err)
    errorMessage.value = '申請に失敗しました'
  }
}

onMounted(() => {
  if (props.initialYamatoId) {
    const safeYamatoId = props.initialYamatoId.startsWith('@')
      ? props.initialYamatoId
      : '@' + props.initialYamatoId
    inputYamatoId.value = safeYamatoId
    search()
  }
})
</script>



<style scoped>

.modal-title {
  color: #111; /* ← ライトモード用の黒文字 */
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}
@media (prefers-color-scheme: dark) {
  .modal-title {
    color: #f5f5f5;
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
}


.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
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
.profile-results {
  display: flex;
  flex-direction: column;
  align-items: center; /* ✅ 中央に寄せる */
  gap: 1.5rem;
  margin-top: 1rem;
}

.profile-preview {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
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
    background-color: #2a2a2a;  /* 落ち着いたダークグレー背景 */
    color: #ffffff;             /* 白文字 */
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
  }

  .profile-preview {
    background-color: #1f1f1f;  /* より濃い背景 */
    border: 1px solid #444;
    color: #ffffff;
  }

  input,
  textarea {
    background-color: #3a3a3a;
    color: #ffffff;
    border: 1px solid #555;
  }

  input::placeholder,
  textarea::placeholder {
    color: #aaaaaa;
  }

  .error {
    color: #ff9999;
  }

  .success {
    color: #b5ffb5;
  }

}

</style>
