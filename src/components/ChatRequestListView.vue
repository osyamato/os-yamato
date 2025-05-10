<template>
  <div class="modal-overlay">
    <div class="modal-title">受信したチャット申請</div>

    <div v-for="req in requests" :key="req.id" class="request-block">
      <p><strong>申請者:</strong> {{ req.senderProfile?.displayName || '不明' }}</p>
      <p><strong>メッセージ:</strong> {{ req.message || '（なし）' }}</p>
      <div class="button-row">
        <YamatoButton @click="accept(req)">承認</YamatoButton>
        <YamatoButton type="danger" @click="reject(req)">拒否</YamatoButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, Auth } from 'aws-amplify'
import { listChatRequests, getPublicProfile } from '@/graphql/queries'
import { updateChatRequest, deleteChatRequest, createChatRoom } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'

const emit = defineEmits(['close', 'refresh'])
const requests = ref([])

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  const mySub = user.attributes.sub

  const res = await API.graphql({
    query: listChatRequests,
    variables: {
      filter: {
        toUserId: { eq: mySub },
        status: { eq: 'pending' }
      }
    },
    authMode: 'AMAZON_COGNITO_USER_POOLS'
  })

  const items = res.data.listChatRequests.items

  const enriched = await Promise.all(
    items.map(async item => {
      try {
        const profileRes = await API.graphql({
          query: getPublicProfile,
          variables: { id: item.fromUserId },
          authMode: 'AMAZON_COGNITO_USER_POOLS'
        })
        item.senderProfile = profileRes.data.getPublicProfile
      } catch {
        item.senderProfile = { displayName: '(取得失敗)' }
      }
      return item
    })
  )

  requests.value = enriched
})

async function accept(req) {
  try {
    await API.graphql({
      query: updateChatRequest,
      variables: { input: { id: req.id, status: 'accepted' } },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    await API.graphql({
      query: createChatRoom,
      variables: {
        input: {
          user1: req.fromUserId,
          user2: req.toUserId,
          lastMessage: '',
          lastTimestamp: new Date().toISOString()
        }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    emit('refresh') // ✅ 親でチャットリストを再取得
    emit('close')    // ✅ モーダルを閉じる
  } catch (err) {
    console.error('❌ 承認処理エラー:', err)
  }
}

async function reject(req) {
  try {
    await API.graphql({
      query: deleteChatRequest,
      variables: { input: { id: req.id } },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    emit('close') // ✅ 拒否時も閉じる
  } catch (err) {
    console.error('❌ 拒否処理エラー:', err)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem 1rem;
  text-align: center;
}

.modal-title {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 2rem;
}

.request-block {
  margin: 1.5rem auto;
  padding: 1rem;
  background: none;
  border: none;
  color: #fff;
  max-width: 500px;
  font-size: 1.1rem;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
@media (prefers-color-scheme: dark) {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.85); /* より深いダークにしてもOK */
  }

  .modal-title,
  .request-block,
  .request-block strong {
    color: #f5f5f5;
  }

  .button-row {
    /* ここでボタンのスタイルも調整可能（必要なら） */
  }
}

</style>

