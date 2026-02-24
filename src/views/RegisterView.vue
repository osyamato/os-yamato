<template>
  <div class="register-wrapper">
    <div class="form-container">
      <!-- タイトル -->
      <h1 class="title" v-if="!completed">
        <span class="brand">OS Yamato</span>
      </h1>

      <div class="form-box" v-if="!completed">

<!-- 🌐 言語ピッカー -->
<div class="lang-select">
  <span>🌐</span>
  <label>{{ $t('auth.language') }}</label>
  <select v-model="locale">
    <option value="ja">{{ $t('japanese') }}</option>
    <option value="en">{{ $t('english') }}</option>
    <option value="es">{{ $t('spanish') }}</option>
    <option value="zh">{{ $t('chinese') }}</option>
    <option value="fr">{{ $t('french') }}</option>
    <option value="id">{{ $t('indonesian') }}</option>
  </select>
</div>

        <!-- ✅ 規約リンク -->
        <div class="policy-links">
          <a href="#" @click.prevent="showTerms = true" class="policy-link">
            {{ $t('auth.viewTerms') }}
          </a>
        </div>

        <!-- ✅ 同意チェック -->
        <div class="terms-check">
          <label>
            <input type="checkbox" v-model="agreed" />
            {{ $t('auth.agreeToTerms') }}
          </label>
        </div>

        <div v-if="step === 'form'" class="input-group">
          <input
            v-model="email"
            type="email"
            :placeholder="$t('auth.email')"
            class="input"
          />
          <input
            v-model="password"
            type="password"
            :placeholder="$t('auth.password')"
            class="input"
          />
          <input
            v-model="confirmPassword"
            type="password"
            :placeholder="$t('auth.passwordConfirm')"
            class="input"
          />
          <button
            @click="handleSignUp"
            class="submit"
            :disabled="!agreed || !passwordsMatch"
          >
            {{ $t('auth.register') }}
          </button>
          <p v-if="!passwordsMatch && confirmPassword" class="message">
            {{ $t('auth.passwordMismatch') }}
          </p>
        </div>

        <div v-else class="input-group">
          <input
            v-model="code"
            type="text"
            :placeholder="$t('auth.confirmCode')"
            class="input"
          />
          <button @click="handleConfirm" class="submit">
            {{ $t('auth.confirm') }}
          </button>

          <p class="resend-link">
            <a @click.prevent="resendCode" class="link">
              {{ $t('auth.resendCode') }}
            </a>
          </p>
        </div>

        <p v-if="message" class="message">{{ message }}</p>

        <p class="link-text">{{ $t('auth.haveAccount') }}</p>
        <p class="link-text">
          <router-link to="/signin" class="link">{{ $t('auth.signinHere') }}</router-link>
        </p>

        <p class="link-text">{{ $t('auth.forgotPasswordPrompt') }}</p>
        <p class="link-text">
          <router-link to="/forgot-password" class="link">{{ $t('auth.forgotPassword') }}</router-link>
        </p>
      </div>

      <p v-else class="center-message">
        {{ t('auth.registerDoneTitle') }}<br>
        {{ t('auth.registerDoneSubtitle') }}
      </p>
    </div>

    <!-- ✅ 規約モーダル -->
    <TermsModal
      v-if="showTerms"
      :visible="true"
      title="規約とポリシー"
      @close="showTerms = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'
import TermsModal from '@/components/TermsModal.vue'
const { t, locale } = useI18n()

const showTerms = ref(false)
const agreed = ref(false)
const completed = ref(false)

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const message = ref('')
const step = ref('form')

const passwordsMatch = computed(() => {
  return password.value && confirmPassword.value && password.value === confirmPassword.value
})

const handleSignUp = async () => {
  if (!agreed.value || !passwordsMatch.value) {
    message.value = t('auth.passwordMismatch')
    return
  }

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
    const msg = error.message || ''
    if (msg === 'User already exists') {
      try {
        await Auth.signIn(email.value, password.value)
        message.value = t('auth.userExists')
      } catch (signInError) {
        if (signInError.code === 'NotAuthorizedException') {
          message.value = t('auth.passwordInvalid')
          return
        }
        if (signInError.code === 'UserNotConfirmedException') {
          router.push({ name: 'verify-email', query: { email: email.value } })
          return
        }
        if (signInError.code === 'UserNotFoundException') {
          message.value = t('auth.userNotFound')
        } else {
          message.value = `${t('auth.error')}: ${signInError.message}`
        }
      }
    } else if (msg.includes('Password did not conform with policy')) {
      message.value = t('auth.passwordTooShort')
    } else if (msg.toLowerCase().includes('password')) {
      message.value = t('auth.passwordInvalid')
    } else {
      message.value = `${t('auth.error')}: ${msg}`
    }
  }
}

const handleConfirm = async () => {
  try {
    message.value = ''
    await Auth.confirmSignUp(email.value, code.value)

    // 🎉 成功時アニメーション表示
    completed.value = true

    // 5秒後にサインインへ
    setTimeout(() => {
      router.push('/signin')
    }, 5000)
  } catch (error) {
    message.value = `${t('auth.error')}: ${error.message || ''}`
  }
}

const resendCode = async () => {
  try {
    await Auth.resendSignUp(email.value)
    message.value = t('auth.codeResent')
  } catch (err) {
    message.value = `${t('auth.error')}: ${err.message}`
  }
}
watch(locale, (newLang) => {
  localStorage.setItem('yamato-locale', newLang)
})

</script>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: inherit;
}

.form-container {
  width: 100%;
  max-width: 420px;
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
  transition: background-color 0.3s, box-shadow 0.3s;
  border: none; /* ← これ重要 */
  height: 3.2rem; /* 他のinputと高さ合わせるなら */
}

.submit:hover {
  background-color: #1f3a5a;
}

.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  color: #d33;
  text-align: center;
  font-size: 0.9rem;
}

.link-text {
  font-size: 1rem;
  margin-top: 0.8rem;
  text-align: center;
}

.link {
  text-decoration: underline;
  color: #274c77;
}

.policy-links {
  text-align: center;
  margin-bottom: 0.5rem;
}

.policy-link {
  color: #274c77;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
}

.terms-check {
  text-align: left;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.terms-check input {
  margin-right: 0.4rem;
}

@media (prefers-color-scheme: dark) {
  .input {
    border-color: #555;
  }

  .link-text {
    color: #ccc;
  }
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

.lang-select {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: inherit;
}

.lang-select select {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #aaa;
}

</style>


