<template>
  <div class="p-4">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold animate-fade-down">しりとり マッチング</h2>
      <button
        @click="showModal = true"
        class="text-white bg-green-500 px-3 py-1 rounded-full hover:bg-green-600"
      >
        ＋
      </button>
    </div>

    <!-- ✅ モーダル：ルーム作成 -->
    <RoomCreateModal
      v-if="showModal"
      :visible="showModal"
      @close="showModal = false"
      @create="handleCreateRoom"
    />

    <!-- ✅ 待機中ルーム一覧 -->
    <h3 class="text-lg mb-2">🕊️ 待機中のルーム</h3>
    <div v-if="rooms.length === 0" class="text-gray-500">参加できるルームがありません</div>

    <ul class="space-y-2">
      <li
        v-for="room in rooms"
        :key="room.id"
        class="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded shadow"
      >
        <div>
          <div class="font-semibold text-black dark:text-white">{{ room.title }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-300">ホスト: {{ room.hostId }}</div>
        </div>
        <button
          @click="joinRoom(room.id)"
          class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          参加
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { useRouter } from 'vue-router'

import RoomCreateModal from '@/components/ShiritoriRoomCreateModal.vue'
import { listShiritoriRooms } from '@/graphql/queries'
import { createShiritoriRoom, updateShiritoriRoom } from '@/graphql/mutations'

const router = useRouter()
const rooms = ref([])
const showModal = ref(false)

// ✅ ルーム一覧取得
async function fetchRooms() {
  try {
    const res = await API.graphql(graphqlOperation(listShiritoriRooms, {
      filter: { status: { eq: 'open' } }
    }))
    rooms.value = res.data.listShiritoriRooms.items
  } catch (e) {
    console.error('❌ ルーム取得失敗', e)
  }
}

// ✅ ルーム作成処理
async function handleCreateRoom({ title, genreKey, charLimit }) {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const input = {
      title,
      hostId: user.username,
      status: 'open',
      genreKey,
      charLimit: charLimit || null
    }
    const res = await API.graphql(graphqlOperation(createShiritoriRoom, { input }))
    router.push(`/shiritori-room/${res.data.createShiritoriRoom.id}`)
  } catch (e) {
    console.error('❌ 作成失敗', e)
  } finally {
    showModal.value = false
  }
}

// ✅ 参加処理
async function joinRoom(roomId) {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const input = {
      id: roomId,
      guestId: user.username,
      status: 'playing'
    }
    await API.graphql(graphqlOperation(updateShiritoriRoom, { input }))
    router.push(`/shiritori-room/${roomId}`)
  } catch (e) {
    console.error('❌ 参加失敗', e)
  }
}

onMounted(fetchRooms)
</script>

<style scoped>
@keyframes fade-down {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-fade-down {
  animation: fade-down 0.6s ease-out;
}
</style>

