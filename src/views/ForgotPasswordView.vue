<template>
  <div class="register-wrapper">
    <div class="form-container">
      <h1 class="title" v-if="!resetCompleted">
        <span class="brand">OS Yamato</span>
      </h1>

      <div class="form-box" v-if="!resetCompleted">
        <div v-if="step === 'request'" class="input-group">
          <input
            v-model="email"
            type="email"
            :placeholder="$t('auth.email')"
            class="input"
          />
          <button @click="requestReset" class="submit">
            {{ $t('auth.sendResetCode') }}
          </button>
        </div>

        <div v-else-if="step === 'confirm'" class="input-group">
          <input
            v-model="code"
            type="text"
            :placeholder="$t('auth.confirmCode')"
            class="input"
          />
          <input
            v-model="newPassword"
            type="password"
            :placeholder="$t('auth.newPassword')"
            class="input"
          />
          <input
            v-model="confirmPassword"
            type="password"
            :placeholder="$t('auth.confirmNewPassword')"
            class="input"
          />
          <button @click="confirmReset" class="submit">
            {{ $t('auth.resetPassword') }}
          </button>
        </div>

        <p v-if="message" class="message">{{ message }}</p>

        <p class="link-text">
          <router-link to="/signin" class="link">
            {{ $t('auth.backToSignIn') }}
          </router-link>
        </p>
      </div>

      <p v-else class="center-message">
        {{ t('auth.resetDoneTitle') }}<br>
        {{ t('auth.resetDoneSubtitle') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const step = ref('request')
const resetCompleted = ref(false)

const requestReset = async () => {
  if (!email.value) {
    message.value = t('auth.emailRequired')
    return
  }

  const safeEmail = email.value.trim()

  try {
    await Auth.forgotPassword(safeEmail)
    step.value = 'confirm'
    message.value = t('auth.codeSent')
  } catch (error) {
    if (
      error.message.includes('no registered/verified') ||
      error.code === 'InvalidParameterException'
    ) {
      message.value = t('auth.userNotConfirmed')
      router.push({
        path: '/verify-email',
        query: { email: encodeURIComponent(safeEmail) }
      })
    } else {
      message.value = `${t('auth.error')}: ${error.message}`
    }
  }
}

const confirmReset = async () => {
  if (newPassword.value !== confirmPassword.value) {
    message.value = t('auth.passwordsDoNotMatch')
    return
  }

  try {
    await Auth.forgotPasswordSubmit(email.value, code.value, newPassword.value)
    resetCompleted.value = true

    // 5秒後にサインインへ
    setTimeout(() => {
      router.push('/signin')
    }, 5000)
  } catch (error) {
    message.value = `${t('auth.error')}: ${error.message}`
  }
}
</script>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: inherit;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: inherit;
}

.brand {
  color: #274c77;
}

.form-box {
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  background-color: transparent;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input {
  height: 3.2rem;
  padding: 0.75rem;
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
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.message {
  margin-top: 1rem;
  color: #d33;
  text-align: center;
  font-size: 0.9rem;
}

.link-text {
  font-size: 1rem;
  margin-top: 1rem;
  color: inherit;
}

.link {
  color: #274c77;
  text-decoration: underline;
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


