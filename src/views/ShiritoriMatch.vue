<template>
  <div class="p-4">
    <!-- ヘッダー -->
    <div class="header header-animated">
      <h2 class="header-title">誰かとしりとり</h2>
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
      v-show="showModal"
      :visible="showModal"
      @close="showModal = false"
      @create="handleCreateRoom"
    />

    <!-- 分岐表示 -->
    <template v-if="rooms.length > 0">
      <!-- ルームリスト -->
      <ul class="space-y-4 max-w-xl mx-auto mt-6">
        <li
          v-for="room in rooms"
          :key="room.id"
          class="room-card"
        >
          <div class="room-info">
            <div class="room-title">{{ room.title }}</div>
            <div class="room-meta">モード：{{ genreLabel(room.genreKey) }}</div>
            <div class="room-meta">文字数：{{ room.charLimit || '無制限' }}</div>
          </div>
          <button class="room-button" @click="joinRoom(room.id)">参加</button>
        </li>
      </ul>
    </template>

    <template v-else>
      <!-- 空状態 -->
      <div class="empty-state animated-hint">
        <p class="text-gray-400 text-lg font-medium">
          誰も待機していません。
        </p>
        <p class="text-gray-400 text-lg font-medium mt-2">
          ＋アイコンから部屋を作って<br>
          少しだけ待ってみましょう。
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { useRouter } from 'vue-router'
import { onActivated } from 'vue'


import RoomCreateModal from '@/components/ShiritoriRoomCreateModal.vue'
import {
  listShiritoriRooms
} from '@/graphql/queries'
import {
  createShiritoriRoom,
  updateShiritoriRoom
} from '@/graphql/mutations'
import {
  onCreateShiritoriRoom,
  onUpdateShiritoriRoom,
  onDeleteShiritoriRoom
} from '@/graphql/subscriptions' // ✅ ここだけで定義！

const router = useRouter()
const rooms = ref([])
const showModal = ref(false)
const iconColor = ref('#f87171')

let createSub = null
let updateSub = null
let deleteSub = null


function getTextColor(bg) {
  if (!bg) return '#000'
  const color = bg.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000' : '#fff'
}

// ✅ ジャンル名表示
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

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#f87171'
  } catch (e) {
    console.error('❌ アイコンカラー取得失敗', e)
  }

  rooms.value = []            // ← キャッシュを明示的にクリア
  await fetchRooms()
  subscribeToRoomChanges()
})

// ✅ クリーンアップ
onUnmounted(() => {
  createSub?.unsubscribe?.()
  updateSub?.unsubscribe?.()
  deleteSub?.unsubscribe?.()
})

// ✅ ルーム取得
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


// ✅ サブスクリプション登録
function subscribeToRoomChanges() {
  createSub = API.graphql(graphqlOperation(onCreateShiritoriRoom)).subscribe({
    next: ({ value }) => {
      const newRoom = value.data.onCreateShiritoriRoom
      if (newRoom.status === 'open') {
        rooms.value.push(newRoom)
      }
    },
    error: e => console.error('onCreate error', e)
  })

  updateSub = API.graphql(graphqlOperation(onUpdateShiritoriRoom)).subscribe({
    next: ({ value }) => {
      const updated = value.data.onUpdateShiritoriRoom
      const index = rooms.value.findIndex(r => r.id === updated.id)

      if (updated.status !== 'open') {
        if (index !== -1) rooms.value.splice(index, 1)
      } else {
        if (index !== -1) rooms.value[index] = updated
        else rooms.value.push(updated)
      }
    },
    error: e => console.error('onUpdate error', e)
  })

  deleteSub = API.graphql(graphqlOperation(onDeleteShiritoriRoom)).subscribe({
    next: ({ value }) => {
      const deleted = value.data.onDeleteShiritoriRoom
      rooms.value = rooms.value.filter(r => r.id !== deleted.id)
    },
    error: e => console.error('onDelete error', e)
  })
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

onActivated(() => {
  rooms.value = []
  setTimeout(() => {
    fetchRooms()
  }, 100)
})

</script>


<style scoped>
/* ヘッダー */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}
.header-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.icon-button {
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.icon-button:hover {
  opacity: 0.85;
}

/* 空状態 */
.empty-state {
  text-align: center;
  margin-top: 3rem;
}

/* カード */
.room-card {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #f4f4f4;
  padding: 0.5rem 0.5rem; /* ✅ 上下余白広め */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  min-height: 140px;
  overflow: hidden;
}

/* テキスト側 */
.room-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.room-title {
  font-size: 1rem;
  font-weight: bold;
}
.room-meta {
  font-size: 0.9rem;
  color: #444;
}

/* 参加ボタン（右下固定） */
.room-button {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  padding: 0.5rem 1.2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}
.room-button:hover {
  background-color: #2563eb;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .room-card {
    background-color: #2e2e2e;
    border: 1px solid #fff;
    color: #f0f0f0;
  }
  .room-meta {
    color: #ccc;
  }
}

@keyframes gentleFloat {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}

.animated-hint {
  animation: gentleFloat 5s ease-in-out infinite;
  text-align: center;
  line-height: 1.6;
}

</style>
