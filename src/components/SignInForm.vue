<template>
  <div class="min-h-screen flex items-center justify-center bg-black px-4">
    <div class="w-full max-w-md text-center">
      <!-- タイトル -->
      <h1 class="text-3xl font-semibold text-white mb-2">
        Hello, <span class="text-green-400">OS Yamato</span>
      </h1>

      <!-- セクション見出し -->
      <h2 class="text-xl text-gray-300 font-medium mb-6">サインイン</h2>

      <!-- フォーム全体 -->
      <div class="bg-gray-900 p-6 rounded-xl shadow-md">
        <!-- ✅ 各要素を個別のdivで囲む -->
        <div class="mb-3">
          <input
            v-model="email"
            type="email"
            placeholder="メールアドレス"
            class="block w-full border border-gray-600 bg-gray-100 text-black rounded-md p-2"
          />
        </div>

        <div class="mb-3">
          <input
            v-model="password"
            type="password"
            placeholder="パスワード"
            class="block w-full border border-gray-600 bg-gray-100 text-black rounded-md p-2"
          />
        </div>

        <div class="mb-3">
          <button
            @click="signIn"
            class="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          >
            サインイン
          </button>
        </div>

        <p v-if="errorMessage" class="text-red-400 text-sm mt-3 text-center">
          {{ errorMessage }}
        </p>

        <p class="mt-4 text-center text-sm text-gray-400">
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
    router.push('/transition') // ✅ サインイン成功後にHomeへ遷移
  } catch (error) {
    errorMessage.value = error.message || 'サインインに失敗しました。'
  }
}
</script>
