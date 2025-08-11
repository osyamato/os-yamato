<template>
  <div class="overlay">
    <h2 class="title">受信したチャット申請</h2>

    <div
      v-for="req in requests"
      :key="req.id"
      class="request-block"
    >
      <p><strong>申請者：</strong>{{ req.senderProfile?.displayName || '不明' }}</p>
      <p><strong>メッセージ：</strong>{{ req.message || '（なし）' }}</p>

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

    emit('refresh')
    emit('close')
  } catch (err) {
    console.error('❌ 承認エラー:', err)
  }
}

async function reject(req) {
  try {
    await API.graphql({
      query: deleteChatRequest,
      variables: { input: { id: req.id } },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })
    emit('close')
  } catch (err) {
    console.error('❌ 拒否エラー:', err)
  }
}
</script>

<style scoped>

</style>
