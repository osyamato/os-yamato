<template>
  <div class="gpt-mini-view">
    <h2>GPT Mini 🌿</h2>

    <!-- 🔽 モード選択 -->
    <div class="mode-select">
      <div
        v-for="mode in modes"
        :key="mode.key"
        class="mode-icon"
        :class="{ active: selectedMode === mode.key }"
        :style="{ backgroundColor: iconColor }"
        @click="selectMode(mode.key)"
      >
        {{ mode.emoji }}
      </div>
    </div>

    <!-- 🔽 セッション一覧 -->
    <div v-if="filteredSessions.length">
      <div
        v-for="session in filteredSessions"
        :key="session.id"
        class="session-card"
        @click="goToSession(session.id)"
      >
        <h3 class="session-title">{{ session.title || '(無題)' }}</h3>
        <p class="session-date">更新: {{ formatDate(session.updatedAt) }}</p>
      </div>
    </div>
    <p v-else>このモードのセッションはありません。</p>

    <!-- 🔽 新規セッション -->
    <button @click="createSession" :disabled="!selectedMode">＋ 新規セッション</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useRouter } from 'vue-router'

const router = useRouter()
const sessions = ref([])
const selectedMode = ref('')
const iconColor = ref('#3b82f6') // デフォルト色

const modes = [
  { key: 'breeze', emoji: '🍃' },
  { key: 'deep', emoji: '🌊' },
  { key: 'poetic', emoji: '✨' }
]

// GraphQL クエリ
const listSessionsQuery = /* GraphQL */ `
  query ListGPTMiniSessions {
    listGPTMiniSessions {
      items {
        id
        title
        mode
        createdAt
        updatedAt
      }
    }
  }
`

const createSessionMutation = /* GraphQL */ `
  mutation CreateGPTMiniSession($input: CreateGPTMiniSessionInput!) {
    createGPTMiniSession(input: $input) {
      id
      title
      mode
      createdAt
      updatedAt
    }
  }
`

async function fetchSessions() {
  try {
    const res = await API.graphql(graphqlOperation(listSessionsQuery))
    sessions.value = res.data.listGPTMiniSessions.items || []
  } catch (e) {
    console.error('❌ セッション取得エラー:', e)
  }
}

async function createSession() {
  try {
    const now = new Date().toISOString()
    const input = {
      mode: selectedMode.value,
      title: '',
      lastOpenedAt: now
    }
    const res = await API.graphql(graphqlOperation(createSessionMutation, { input }))
    console.log('✅ 新規セッション作成:', res.data.createGPTMiniSession.id)
    await fetchSessions()
  } catch (e) {
    console.error('❌ セッション作成エラー:', e)
  }
}

function selectMode(mode) {
  selectedMode.value = mode
}

const filteredSessions = computed(() =>
  sessions.value.filter(s => s.mode === selectedMode.value)
)

function goToSession(id) {
  router.push({ name: 'gpt-mini-chat', params: { id } })
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(async () => {
  fetchSessions()

  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#3b82f6'
  } catch (e) {
    console.warn('⚠️ アイコンカラー取得失敗:', e)
  }
})
</script>

<style scoped>
.gpt-mini-view {
  padding: 20px;
  text-align: center;
}

.mode-select {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.mode-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mode-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.mode-icon.active {
  outline: 2px solid white;
}

.session-card {
  background: #333;
  color: white;
  margin: 12px 0;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
}

.session-card:hover {
  background: #444;
}

.session-title {
  font-size: 1.3rem;
  margin: 0 0 6px;
}

.session-date {
  font-size: 0.9rem;
  opacity: 0.7;
}

button:disabled {
  opacity: 0.5;
}
</style>
