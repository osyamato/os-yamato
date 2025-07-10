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
        :style="getIconStyle(mode.key)"
        @click="toggleMode(mode.key)"
      >
        {{ mode.emoji }}
      </div>
    </div>

    <!-- 🔽 モードテキスト -->
    <p v-if="selectedMode" class="mode-text">モード: {{ getModeLabel(selectedMode) }}</p>
    <p v-else class="hint-text">アイコンを選んで問いかけてみよう</p>

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
    <p v-else-if="selectedMode">このモードのセッションはありません。</p>

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
const iconColor = ref('#3b82f6')

const modes = [
  { key: 'breeze', emoji: '🍃', label: 'そよ風' },
  { key: 'deep', emoji: '🌊', label: '深い思索' },
  { key: 'poetic', emoji: '✨', label: '詩的' }
]

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
    await API.graphql(graphqlOperation(createSessionMutation, { input }))
    await fetchSessions()
  } catch (e) {
    console.error('❌ セッション作成エラー:', e)
  }
}

function toggleMode(mode) {
  if (selectedMode.value === mode) {
    selectedMode.value = ''
  } else {
    selectedMode.value = mode
  }
}

function getModeLabel(modeKey) {
  const mode = modes.find(m => m.key === modeKey)
  return mode ? mode.label : ''
}

function getIconStyle(mode) {
  const isActive = selectedMode.value === mode
  return {
    backgroundColor: isActive ? '#ffffff' : iconColor.value,
    color: isActive ? '#000000' : '#ffffff',
    boxShadow: isActive ? '0 0 6px rgba(0, 0, 0, 0.5)' : 'none'
  }
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
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}

.gpt-mini-view h2 {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  color: black !important;
  margin-bottom: 1.5rem;
}
@media (prefers-color-scheme: dark) {
  .gpt-mini-view h2 {
    color: white !important;
  }
}

.mode-select {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.mode-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mode-icon:hover {
  transform: scale(1.1);
}

.mode-text {
  margin: 0.5rem 0 1rem;
  font-size: 1rem;
  color: #333;
  text-align: center; /* ← ここで中央揃え */
}
@media (prefers-color-scheme: dark) {
  .mode-text {
    color: #ccc;
  }
}

.hint-text {
  margin: 1rem 0;
  font-size: 0.95rem;
  color: #666;
  text-align: center;
}

.session-card {
  width: 330px;
  height: 90px;
  background: white;
  border-bottom: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: var(--yamato-shadow, 0 2px 4px rgba(0, 0, 0, 0.05));
  padding: 0.8rem 0.8rem 0.8rem 2.4rem;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  margin: 0 auto 0.5rem;
}
@media (min-width: 768px) {
  .session-card {
    width: 400px;
  }
}
@media (min-width: 1024px) {
  .session-card {
    width: 480px;
  }
}
@media (prefers-color-scheme: dark) {
  .session-card {
    background: #444;
    color: #fff;
    border-bottom: 1px solid #666;
  }
}
.session-card:hover {
  background: #f9f9f9;
}
@media (prefers-color-scheme: dark) {
  .session-card:hover {
    background: #555;
  }
}

.session-title {
  font-weight: bold;
  font-size: 1rem;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-date {
  font-size: 0.85rem;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (prefers-color-scheme: dark) {
  .session-date {
    color: #ccc;
  }
}

button:disabled {
  opacity: 0.5;
}
</style>
