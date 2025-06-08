<template>
  <div class="chat-room-list">
<h2 class="header-title">{{ t('wind.cloudListTitle') }}</h2>

    <div class="room-list">
      <div
        v-for="room in sortedRooms"
        :key="room.id"
        class="room-card"
      >
        <p class="partner-name">
          {{ getPartnerDisplayName(room) }}
        </p>

        <p class="last-message">
          {{ room.lastMessage || '' }}
        </p>

        <small class="last-time">{{ formatTime(room.lastTimestamp) }}</small>

<div class="reopen-button-wrapper">
<YamatoButton @click="restoreRoom(room)">
  {{ t('wind.restoreButton') }}
</YamatoButton>
</div>
 </div>   
 </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listChatRooms, getPublicProfile } from '@/graphql/queries'
import { updateChatRoom } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()


const mySub = ref('')
const chatRooms = ref([])
const partnerProfiles = ref({})

onMounted(async () => {
  await fetchHiddenChatRooms()
})

async function fetchHiddenChatRooms() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    mySub.value = user.attributes.sub

    const res = await API.graphql(graphqlOperation(listChatRooms, {
      filter: {
        or: [
          { user1: { eq: mySub.value } },
          { user2: { eq: mySub.value } }
        ]
      }
    }))

    const allRooms = res.data.listChatRooms.items || []

    const hiddenRooms = allRooms.filter(room => {
      return (
        (room.user1 === mySub.value && room.deletedByUser1) ||
        (room.user2 === mySub.value && room.deletedByUser2)
      )
    })

    chatRooms.value = hiddenRooms

    // プロフィール取得
    for (const room of hiddenRooms) {
      const partnerId = room.user1 === mySub.value ? room.user2 : room.user1
      if (!partnerProfiles.value[partnerId]) {
        const res = await API.graphql(graphqlOperation(getPublicProfile, { id: partnerId }))
        partnerProfiles.value[partnerId] = res.data.getPublicProfile
      }
    }
  } catch (err) {
    console.error('❌ 非表示チャット取得エラー:', err)
  }
}

async function restoreRoom(room) {
  const input = {
    id: room.id,
    ...(room.user1 === mySub.value
      ? { deletedByUser1: false }
      : { deletedByUser2: false })
  }

  try {
    await API.graphql(graphqlOperation(updateChatRoom, { input }))
    await fetchHiddenChatRooms()
  } catch (err) {
    console.error('❌ 再表示エラー:', err)
  }
}

function getPartnerDisplayName(room) {
  const partnerSub = room.user1 === mySub.value ? room.user2 : room.user1
  return partnerProfiles.value[partnerSub]?.displayName || '（未設定）'
}

function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  return date.toLocaleString('ja-JP', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

const sortedRooms = computed(() => {
  return [...chatRooms.value].sort((a, b) => {
    return new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0)
  })
})
</script>

<style scoped>
.header-title {
  font-size: 1.4rem;
  text-align: center;
  margin-bottom: 1rem;
}
.room-card {
  padding: 1rem;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}
.partner-name {
  font-weight: bold;
  font-size: 1.1rem;
}
.last-message {
  font-size: 0.95rem;
  color: #888;
}
.last-time {
  font-size: 0.8rem;
  color: #aaa;
}
.button-row {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}
.reopen-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1rem; /* 任意で余白 */
}
.chat-room-list {
  animation: dropDown 0.5s ease-out;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
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


</style>

