<template>
  <div class="min-h-screen flex items-center justify-center bg-black px-4">
    <div class="w-full max-w-md text-center">
      <!-- タイトル -->
      <h1 class="text-4xl font-semibold mb-16">
        <span class="text-[#274c77]">Hello,</span> <span class="text-white">OS Yamato</span>
      </h1>

      <!-- フォーム本体 -->
      <div class="bg-gray-900 bg-opacity-70 p-12 rounded-2xl shadow-xl backdrop-blur-md space-y-12">
        <!-- メールアドレス & パスワード -->
        <div class="space-y-8">
          <input
            v-model="email"
            type="email"
            :placeholder="$t('auth.email')"
            class="block w-full bg-white bg-opacity-80 border border-gray-300 focus:border-[#274c77] focus:ring-0 rounded-lg p-4 h-14 transition duration-150"
          />
          <input
            v-model="password"
            type="password"
            :placeholder="$t('auth.password')"
            class="block w-full bg-white bg-opacity-80 border border-gray-300 focus:border-[#274c77] focus:ring-0 rounded-lg p-4 h-14 transition duration-150"
          />
        </div>

        <!-- サインインボタン -->
        <div class="mt-10">
          <button
            @click="signIn"
            class="w-full bg-gradient-to-r from-[#274c77] to-[#3c6fa6] hover:from-[#1f3a5a] hover:to-[#2f5a86] text-white font-semibold py-4 px-4 rounded-xl shadow-lg text-lg h-14 transition duration-200"
          >
            {{ $t('auth.signin') }}
          </button>
        </div>

        <!-- エラーメッセージ -->
        <p v-if="errorMessage" class="text-red-400 text-sm text-center -mt-6">
          {{ errorMessage }}
        </p>

        <!-- アカウント案内 -->
        <p class="text-center text-base text-gray-300 mt-10">
          {{ $t('auth.noAccount') }}
          <router-link to="/register" class="underline" style="color: #274c77">
            {{ $t('auth.registerHere') }}
          </router-link>
        </p>

        <!-- Yamatoについて -->
        <p class="text-center text-sm mt-6">
          <router-link to="/about" class="hover:underline" style="color: #274c77">
            {{ $t('about.linkText') }}
          </router-link>
        </p>

        <!-- 🌐 言語ピッカー -->
        <div class="mt-16 flex justify-center items-center gap-2 text-white text-sm">
          <span class="text-lg">🌐</span>
          <label class="mr-1">{{ $t('auth.language') }}</label>
          <select
            v-model="locale"
            class="rounded px-3 py-1 border border-blue-500 bg-white bg-opacity-90 text-black focus:outline-none"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Auth } from 'aws-amplify'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()
const { locale } = useI18n()

const signIn = async () => {
  errorMessage.value = ''
  try {
    await Auth.signIn(email.value, password.value)
    router.push('/transition')
  } catch (error) {
    errorMessage.value = error.message || 'サインインに失敗しました。'
  }
}

watch(locale, (newLang) => {
  localStorage.setItem('yamato-locale', newLang)
})
</script>

<style scoped>
input,
select,
button {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}
</style>
