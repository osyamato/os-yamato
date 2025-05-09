<template>
  <div class="setup-container">
    <h2>プロフィールを登録</h2>

    <input
      v-model="yamatoId"
      placeholder="Yamato ID（@から始まる）"
      @input="validateAtMark"
    />
    <input v-model="displayName" placeholder="表示名（任意）" />
    <textarea v-model="bio" placeholder="自己紹介（任意）" rows="4" />

<div class="button-row">
  <YamatoButton @click="register">登録する</YamatoButton>
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
  padding: 0; /* モーダル側に任せる */
  background: none;
  border: none;
  border-radius: 0;
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

</style>
