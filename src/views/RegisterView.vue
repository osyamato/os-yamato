<template>
  <div class="register-wrapper">
    <div class="form-container">
      <!-- タイトル -->
      <h1 class="title">
        <span class="brand">OS Yamato</span>
      </h1>

      <div class="form-box">
        <!-- ✅ 規約リンク -->
        <div class="policy-links">
          <a href="#" @click.prevent="showTerms = true" class="policy-link">
            規約とポリシーを確認
          </a>
        </div>

        <!-- ✅ 同意チェック -->
        <div class="terms-check">
          <label>
            <input type="checkbox" v-model="agreed" />
            利用規約とプライバシーポリシーに同意します
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
          <button @click="handleSignUp" class="submit" :disabled="!agreed">
            {{ $t('auth.register') }}
          </button>
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

          <!-- 🔁 再送リンク -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'

import TermsModal from '@/components/TermsModal.vue' // ✅ 追加
const showTerms = ref(false)  

const agreed = ref(false)  

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const code = ref('')
const message = ref('')
const step = ref('form')

// ✅ 新規登録
const handleSignUp = async () => {
  if (!agreed.value) {
    message.value = '利用規約に同意してください。'
    return
  }

  try {
    message.value = ''

    // ✨ 新規ユーザー登録を試みる
    await Auth.signUp({
      username: email.value,
      password: password.value,
      attributes: { email: email.value },
    })

    // 登録成功 → 認証ステップへ
    message.value = t('auth.codeSent')
    step.value = 'confirm'

  } catch (error) {
    const msg = error.message || ''

    if (msg === 'User already exists') {
      // 🔄 ユーザーがすでに存在する場合 → サインインを試す
      try {
        await Auth.signIn(email.value, password.value)

        // サインイン成功 → 認証済みの既存ユーザー
        message.value = t('auth.userExists')

      } catch (signInError) {
        // 🚫 パスワードが違う場合
        if (signInError.code === 'NotAuthorizedException') {
          message.value = t('auth.passwordInvalid')
          return
        }

        // 🟡 メール未確認
        if (signInError.code === 'UserNotConfirmedException') {
          router.push({
            name: 'verify-email',
            query: { email: email.value },
          })
          return
        }

        // その他の認証エラー
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


// ✅ 確認コード入力処理
const handleConfirm = async () => {
  try {
    message.value = ''
    await Auth.confirmSignUp(email.value, code.value)
    message.value = t('auth.success')
  } catch (error) {
    message.value = `${t('auth.error')}: ${error.message || ''}`
  }
}

// ✅ 認証コード再送
const resendCode = async () => {
  try {
    await Auth.resendSignUp(email.value)
    message.value = t('auth.codeResent')
  } catch (err) {
    message.value = `${t('auth.error')}: ${err.message}`
  }
}

// ✅ サインイン処理（別用途の補助的な関数）
const handleSignIn = async () => {
  try {
    message.value = ''
    await Auth.signIn(email.value, password.value)
    router.push('/transition')
  } catch (error) {
    if (error.code === 'UserNotConfirmedException') {
      router.push({
        name: 'verify-email',
        query: { email: email.value }
      })
    } else {
      message.value = `${t('auth.error')}: ${error.message}`
    }
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
  transition: background-color 0.3s;
}

.submit:hover {
  background-color: #1f3a5a;
}

.message {
  margin-top: 1rem; /* または 16px 〜 24px 程度 */
  color: #d33;       /* エラーなら赤っぽく */
  text-align: center;
  font-size: 0.9rem;
}

.link-text {
  font-size: 1rem;
  margin-top: 0.8rem;
  text-align: center;
  color: inherit;
}

.link {
  display: inline-block;
  margin-top: 0.2rem;
  text-decoration: underline;
  color: #274c77;
}

/* ✅ ダークモードはOSの色に従う（背景色は指定しない） */
@media (prefers-color-scheme: dark) {
  .input {
    border-color: #555;
  }

  .link-text {
    color: #ccc;
  }
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


</style>
