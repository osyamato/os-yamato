<template>
  <div class="register-form">
    <div v-if="step === 'form'">
      <h2>新規登録</h2>
      <input v-model="email" type="email" placeholder="メールアドレス" required />
      <input v-model="password" type="password" placeholder="パスワード" required />
      <button @click="handleSignUp">登録する</button>
    </div>

    <div v-else>
      <h2>確認コードを入力</h2>
      <input v-model="code" type="text" placeholder="6桁の確認コード" required />
      <button @click="handleConfirm">確認する</button>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Auth } from 'aws-amplify'

const email = ref('')
const password = ref('')
const code = ref('')
const message = ref('')
const step = ref('form') // 'form' or 'confirm'

const handleSignUp = async () => {
  try {
    message.value = ''
    await Auth.signUp({
      username: email.value,
      password: password.value,
      attributes: {
        email: email.value,
      },
    })
    message.value = '✅ 確認コードをメールに送信しました'
    step.value = 'confirm'
  } catch (error) {
    console.error('登録エラー:', error)
    message.value = `登録エラー：${error.message}`
  }
}

const handleConfirm = async () => {
  try {
    message.value = ''
    await Auth.confirmSignUp(email.value, code.value)
    message.value = '🎉 登録が完了しました！サインインしてください'
    // router.push('/signin') もここで可能
  } catch (error) {
    console.error('確認エラー:', error)
    message.value = `確認エラー：${error.message}`
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
}
input {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
.message {
  margin-top: 1rem;
  color: green;
}
</style>
