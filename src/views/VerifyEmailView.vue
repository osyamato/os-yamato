<template>
  <div class="verify-wrapper">
    <h1 class="title" v-if="!confirmed">
      <span class="brand">OS Yamato</span>
    </h1>

    <template v-if="!confirmed">
      <p class="instruction">{{ $t('auth.userNotConfirmed') }}</p>

      <input
        v-model="email"
        type="email"
        :placeholder="$t('auth.email')"
        class="input"
      />

      <input
        v-model="code"
        type="text"
        :placeholder="$t('auth.confirmCode')"
        class="input"
      />

      <button @click="handleConfirm" class="submit">
        {{ $t('auth.confirm') }}
      </button>

      <p class="link-text">
        <a @click.prevent="resendCode" class="link">
          {{ $t('auth.resendCode') }}
        </a>
        /
        <router-link to="/forgot-password" class="link">
          {{ $t('auth.forgotPassword') }}
        </router-link>
      </p>

      <p v-if="message" class="message">{{ message }}</p>
    </template>

    <template v-else>
<p class="center-message">
  {{ t('auth.verifiedTitle') }}<br>
  {{ t('auth.verifiedSubtitle') }}
</p>
    </template>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const email = ref('')
const code = ref('')
const message = ref('')
const confirmed = ref(false)

onMounted(() => {
  if (route.query.email) {
    email.value = decodeURIComponent(route.query.email)
  }
})

const handleConfirm = async () => {
  try {
    message.value = ''
    await Auth.confirmSignUp(email.value, code.value)
    confirmed.value = true

    // 5秒後にサインインへ
    setTimeout(() => {
      router.push('/signin')
    }, 5000)
  } catch (error) {
    message.value = `${t('auth.error')}: ${error.message}`
  }
}

const resendCode = async () => {
  try {
    message.value = ''
    await Auth.resendSignUp(email.value)
    message.value = t('auth.codeResent')
  } catch (error) {
    message.value = `${t('auth.error')}: ${error.message}`
  }
}

</script>

<style scoped>

.verify-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: inherit;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: inherit;
}

.brand {
  color: #274c77;
}

.instruction {
  margin-bottom: 1rem;
}

.input {
  width: 100%;
  max-width: 360px;
  height: 3rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  background-color: transparent;
  color: inherit;
  font-size: 1rem;
}

.submit {
  background-color: #274c77;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.submit:hover {
  background-color: #1f3a5a;
}

.link-text {
  font-size: 0.95rem;
  margin-top: 1rem;
}

.link {
  color: #274c77;
  text-decoration: underline;
  cursor: pointer;
}

.message {
  margin-top: 1rem;
  color: #d33;
  font-size: 0.9rem;
}

.center-message {
  font-size: 1.1rem;
  color: #274c77;
  animation: fadeInOut 5s forwards;
  white-space: pre-line;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}


</style>

