<template>
  <div class="setup-container">
<h2 class="setup-title">プロフィールを登録</h2>

    <input
      v-model="yamatoId"
      placeholder="Yamato ID（@から始まる）"
      @input="validateAtMark"
    />
    <input v-model="displayName" placeholder="名前やニックネーム" />
    <textarea v-model="bio" placeholder="自己紹介（任意）" rows="4" />

<div class="button-row">
  <YamatoButton @click="register">登録する</YamatoButton>
</div>
<div class="go-hidden">
  <button class="hidden-icon" @click="goToHidden">
    ☁️
  </button>
</div>

    <p v-if="errorMessage" class="error">❌ {{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { createPublicProfile, updatePublicProfile } from '@/graphql/mutations'
import { getPublicProfile } from '@/graphql/queries'
import YamatoButton from '@/components/YamatoButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToHidden() {
  router.push('/hidden-chat-rooms')
}


const yamatoId = ref('')
const displayName = ref('')
const icon = ref('')
const bio = ref('')
const errorMessage = ref('')

const emit = defineEmits(['close', 'refresh'])

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub
    const res = await API.graphql(graphqlOperation(getPublicProfile, { id: sub }))
    const profile = res.data.getPublicProfile
    if (profile) {
      yamatoId.value = profile.yamatoId || ''
      displayName.value = profile.displayName || ''
      icon.value = profile.icon || ''
      bio.value = profile.bio || ''
    }
  } catch (err) {
    console.error('⚠️ プロフィールの取得失敗:', err)
  }
})

function validateAtMark() {
  if (!yamatoId.value.startsWith('@')) {
    yamatoId.value = '@' + yamatoId.value.replace(/^@+/, '')
  }
}

async function register() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub
    const input = {
      id: sub,
      yamatoId: yamatoId.value,
      displayName: displayName.value,
      icon: icon.value,
      bio: bio.value
    }

    const existing = await API.graphql(graphqlOperation(getPublicProfile, { id: sub }))
    if (existing.data.getPublicProfile) {
      await API.graphql(graphqlOperation(updatePublicProfile, { input }))
    } else {
      await API.graphql(graphqlOperation(createPublicProfile, { input }))
    }

    emit('refresh')
    emit('close')
  } catch (err) {
    console.error('❌ 登録エラー:', err)
    errorMessage.value = '登録に失敗しました'
  }
}
</script>

<style scoped>
.setup-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
}

.setup-title {
  color: #111; /* ← ライトモード用の黒文字 */
  font-size: 1.2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  margin-bottom: 1rem;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .setup-title {
    color: #fff; /* ダークモードでは白に */
  }
}

input,
textarea {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  box-sizing: border-box;
}

.error {
  margin-top: 1rem;
  color: red;
  font-weight: bold;
}

@media (prefers-color-scheme: dark) {
  input,
  textarea {
    background: #3a3a3a;
    color: #f5f5f5;
    border: 1px solid #666;
  }

  input::placeholder,
  textarea::placeholder {
    color: #aaa;
  }

  .error {
    color: #ffb3b3;
  }
}

.button-row {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
.go-hidden {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.hidden-icon {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #e89b9b; /* ✅ 淡い紅梅色 */
  transition: transform 0.2s ease, color 0.3s ease;
}

.hidden-icon:hover {
  transform: scale(1.2);
  color: #f5c6c6; /* ✅ ホバー時にさらに淡く上品に */
}

</style>
