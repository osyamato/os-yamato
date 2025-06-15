<template>
  <div class="min-h-screen flex items-center justify-center bg-black px-4">
    <div class="w-full max-w-md text-center">
      <!-- タイトル -->
      <h1 class="text-4xl font-semibold text-white mb-8">
        <span class="text-[#274c77]">OS Yamato</span> 登録
      </h1>

      <div class="bg-gray-900 p-8 rounded-xl shadow-md space-y-8">
        <div v-if="step === 'form'" class="space-y-6">
          <input
            v-model="email"
            type="email"
            :placeholder="$t('auth.email')"
            class="block w-full border border-gray-600 bg-gray-100 text-black rounded-md p-4 h-14"
          />
          <input
            v-model="password"
            type="password"
            :placeholder="$t('auth.password')"
            class="block w-full border border-gray-600 bg-gray-100 text-black rounded-md p-4 h-14"
          />
          <button
            @click="handleSignUp"
            class="w-full bg-[#274c77] hover:bg-[#1f3a5a] text-white font-semibold py-3 px-4 rounded-xl shadow-md text-lg h-14 transition duration-200"
          >
            {{ $t('auth.register') }}
          </button>
        </div>

        <div v-else class="space-y-6">
          <input
            v-model="code"
            type="text"
            :placeholder="$t('auth.confirmCode')"
            class="block w-full border border-gray-600 bg-gray-100 text-black rounded-md p-4 h-14"
          />
          <button
            @click="handleConfirm"
            class="w-full bg-[#274c77] hover:bg-[#1f3a5a] text-white font-semibold py-3 px-4 rounded-xl shadow-md text-lg h-14 transition duration-200"
          >
            {{ $t('auth.confirm') }}
          </button>
        </div>

        <p v-if="message" class="text-green-400 text-sm text-center -mt-4">
          {{ message }}
        </p>

        <p class="text-center text-base text-gray-300">
          {{ $t('auth.haveAccount') }}
          <router-link to="/signin" class="underline" style="color: #274c77">
            {{ $t('auth.signinHere') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const email = ref('')
const password = ref('')
const code = ref('')
const message = ref('')
const step = ref('form')

const handleSignUp = async () => {
  try {
    message.value = ''
    await Auth.signUp({
      username: email.value,
      password: password.value,
      attributes: { email: email.value },
    })
    message.value = t('auth.codeSent')
    step.value = 'confirm'
  } catch (error) {
    message.value = `${t('auth.error')}: ${error.message}`
  }
}

const handleConfirm = async () => {
  try {
    message.value = ''
    await Auth.confirmSignUp(email.value, code.value)
    message.value = t('auth.success')
  } catch (error) {
    message.value = `${t('auth.error')}: ${error.message}`
  }
}
</script>

<style scoped>
input,
button {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}
</style>


