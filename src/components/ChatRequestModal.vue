<template>
  <div class="chat-request-list">
    <h2 class="title">受信したチャット申請</h2>

    <div v-if="requests.length === 0" class="empty">
      現在、チャット申請はありません。
    </div>

    <div v-for="req in requests" :key="req.id" class="request-card">
      <div class="info">
        <p>申請者: {{ req.senderProfile?.displayName || '不明' }}</p>
        <p>メッセージ: {{ req.message || '(なし)' }}</p>
      </div>
      <div class="actions">
        <YamatoButton @click="accept(req)">承認</YamatoButton>
        <YamatoButton type="danger" @click="reject(req)">拒否</YamatoButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, Auth } from 'aws-amplify'
import { updateChatRequest, deleteChatRequest, createChatRoom } from '@/graphql/mutations'
import { listChatRequests, getPublicProfile } from '@/graphql/queries'
import YamatoButton from '@/components/YamatoButton.vue'

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

  // displayName / yamatoId を取得
  const enrichedRequests = await Promise.all(
    items.map(async item => {
      try {
        const profileRes = await API.graphql({
          query: getPublicProfile,
          variables: { id: item.fromUserId },
          authMode: 'AMAZON_COGNITO_USER_POOLS'
        })
        item.senderProfile = profileRes.data.getPublicProfile
      } catch {
        item.senderProfile = { displayName: '(取得失敗)', yamatoId: '不明' }
      }
      return item
    })
  )

  requests.value = enrichedRequests
})

async function accept(req) {
  await API.graphql({
    query: updateChatRequest,
    variables: {
      input: {
        id: req.id,
        status: 'accepted'
      }
    },
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

  requests.value = requests.value.filter(r => r.id !== req.id)
}

async function reject(req) {
  try {
    await API.graphql({
      query: deleteChatRequest,
      variables: {
        input: { id: req.id }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    requests.value = requests.value.filter(r => r.id !== req.id)
  } catch (err) {
    console.error('❌ 拒否エラー:', err)
    alert('リクエストの拒否中にエラーが発生しました')
  }
}
</script>

<style scoped>
.chat-request-list {
  padding: 2rem;
  font-family: sans-serif;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty {
  color: #777;
  margin-top: 1rem;
}

.request-card {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fafafa;
}

.info {
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
}
</style>
