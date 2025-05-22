<template>
  <div class="min-h-screen flex items-center justify-center bg-black px-4">
    <div class="w-full max-w-md text-center">
      <!-- タイトル -->
      <h1 class="text-4xl font-semibold text-white mb-4">
        Hello, <span style="color: #274c77">OS Yamato</span>
      </h1>

      <!-- フォーム本体 -->
      <div class="bg-gray-900 p-6 rounded-xl shadow-md">
        <!-- メールアドレス -->
        <div class="mb-4">
<input
  v-model="email"
  type="email"
  placeholder="メールアドレス"
  class="block w-full border border-gray-600 bg-gray-100 text-black rounded-md p-4 h-14"
  style="font-size: 16px"
/>
        </div>

        <!-- パスワード -->
        <div class="mb-4">
<input
  v-model="password"
  type="password"
  placeholder="パスワード"
  class="block w-full border border-gray-600 bg-gray-100 text-black rounded-md p-4 h-14"
  style="font-size: 16px"
/>
        </div>

        <!-- サインインボタン -->
        <div class="mb-4">
          <button
            @click="signIn"
            class="w-full bg-[#274c77] hover:bg-[#1f3a5a] text-white font-semibold py-3 px-4 rounded-xl shadow-md text-lg h-14 transition duration-200"
          >
            サインイン
          </button>
        </div>

        <!-- エラーメッセージ -->
        <p v-if="errorMessage" class="text-red-400 text-sm mt-3 text-center">
          {{ errorMessage }}
        </p>

        <!-- アカウント案内 -->
        <p class="mt-4 text-center text-base text-gray-400">
          アカウントをお持ちでない方は
          <router-link to="/register" class="text-green-400 underline">こちら</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Auth } from 'aws-amplify'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

const signIn = async () => {
  errorMessage.value = ''
  try {
    await Auth.signIn(email.value, password.value)
    router.push('/transition')
  } catch (error) {
    errorMessage.value = error.message || 'サインインに失敗しました。'
  }
}
</script>
