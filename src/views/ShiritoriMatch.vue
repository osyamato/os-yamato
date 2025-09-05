<template>
  <div class="p-4">
    <!-- ヘッダー -->
    <div class="header header-animated">
      <h2 class="header-title">しりとり マッチング</h2>
      <button
        class="icon-button"
        @click="showModal = true"
        :style="{ backgroundColor: iconColor, color: getTextColor(iconColor) }"
      >
        ＋
      </button>
    </div>

    <!-- モーダル -->
    <RoomCreateModal
      v-if="showModal"
      :visible="showModal"
      @close="showModal = false"
      @create="handleCreateRoom"
    />

    <!-- 待機中ルームがない -->
    <div v-if="rooms.length === 0" class="empty-state">
      <h3 class="text-lg font-medium mb-1">🕊️ 待機中の部屋</h3>
      <p class="text-gray-400">誰も待機していません。</p>
      <p class="text-gray-400 text-sm mt-1">
        ＋アイコンから部屋を作って、少しだけ待ってみましょう。
      </p>
    </div>

    <!-- 待機中ルーム一覧 -->
    <div v-else class="room-list-wrapper">
      <ul class="space-y-4 max-w-md mx-auto">
        <li
          v-for="room in rooms"
          :key="room.id"
          class="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded shadow"
        >
          <div class="text-2xl">🚪</div>
          <div class="mt-2 text-base font-semibold text-black dark:text-white">
            {{ room.title }}
          </div>
          <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
            モード：{{ genreLabel(room.genreKey) }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300">
            文字数：{{ room.charLimit || '無制限' }}
          </div>
          <button
            @click="joinRoom(room.id)"
            class="mt-3 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            参加
          </button>
        </li>
      </ul>
    </div>
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
const iconColor = ref('#f87171')

// ✅ ジャンル表示マップ
function genreLabel(key) {
  const map = {
    any: '🌈 なんでも',
    food: '🍙 食べ物',
    animal: '🦁 動物',
    sport: '⚽ スポーツ',
    place: '🗺️ 場所'
  }
  return map[key] || '❓ 未設定'
}

// ✅ 文字色調整（背景によって黒or白）
function getTextColor(bg) {
  if (!bg) return '#000'
  const color = bg.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000' : '#fff'
}

// ✅ onMounted: 色取得と部屋一覧
onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#f87171'
  } catch (e) {
    console.error('❌ アイコンカラー取得失敗', e)
  }

  fetchRooms()
})

// ✅ 部屋一覧取得
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

// ✅ 作成処理
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
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}
.header-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.icon-button {
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.icon-button:hover {
  opacity: 0.85;
}

.empty-state {
  text-align: center;
  margin-top: 3rem;
}

.header-animated {
  animation: fadeSlideDown 0.6s ease-out;
}
@keyframes fadeSlideDown {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

