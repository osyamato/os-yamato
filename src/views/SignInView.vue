<template>
<div class="signin-root" @click="handleBackgroundTap">
    <!-- 🌸 桜の花びら（12枚） -->
    <img
      v-for="petal in sakuraList"
      :key="petal.id"
      src="/sakura.time10.png"
      class="sakura-petal"
      :style="{
        left: petal.left,
        animationDelay: petal.delay,
        animationDuration: petal.duration
      }"
    />

    <!-- 🌸 サインインフォーム本体 -->
    <div class="form-wrapper">
      <h1 class="title">
        <span class="highlight">Hello,</span> <span class="main">OS Yamato</span>
      </h1>

      <div class="form-card">
        <input
          v-model="email"
          type="email"
          :placeholder="$t('auth.email')"
          class="form-input"
        />
        <input
          v-model="password"
          type="password"
          :placeholder="$t('auth.password')"
          class="form-input"
        />

        <button class="form-button" @click="signIn">
          {{ $t('auth.signin') }}
        </button>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <p class="text">
          {{ $t('auth.noAccount') }}
          <router-link to="/register" class="link">
            {{ $t('auth.registerHere') }}
          </router-link>
        </p>

        <p class="text small">
          <router-link to="/about" class="link">{{ $t('about.linkText') }}</router-link>
        </p>

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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Auth } from 'aws-amplify'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()
const { locale } = useI18n()

const sakuraList = ref([])

onMounted(() => {
  sakuraList.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${8 + Math.random() * 4}s`
  }))
})

const signIn = async () => {
  errorMessage.value = ''
  try {
    await Auth.signIn(email.value, password.value)
    router.push('/transition')
  } catch (error) {
    errorMessage.value = error.message || 'サインインに失敗しました。'
  }
}
const handleBackgroundTap = (event) => {
  const target = event.target
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
  if (!isInput) {
    // アクティブな要素のフォーカスを外す
    const active = document.activeElement
    if (active && typeof active.blur === 'function') {
      active.blur()
    }
  }
}

watch(locale, (newLang) => {
  localStorage.setItem('yamato-locale', newLang)
})
</script>

<style scoped>
.signin-root {
  background-color: white;
  min-height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.sakura-petal {
  position: absolute;
  top: -50px;
  width: 32px;
  opacity: 0.8;
  pointer-events: none;
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
  text-align: center;
  z-index: 1;
}

.title {
  font-size: 2.2rem;
  margin-bottom: 2rem;
}
.highlight {
  color: #274c77;
}
.main {
  color: #111;
}

.form-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
}

.form-input {
  display: block;
  width: 100%;
  padding: 1rem;
  font-size: 16px;
  margin-bottom: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 0.75rem;
  background: white;
  -webkit-text-size-adjust: 100%;
}

.form-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  color: white;
  background: linear-gradient(to right, #274c77, #3c6fa6);
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.error-msg {
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.text {
  color: #444;
  font-size: 0.95rem;
}
.text.small {
  font-size: 0.85rem;
  margin-top: 1rem;
}

.link {
  color: #274c77;
  text-decoration: underline;
  margin-left: 0.2rem;
}

.lang-select {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #333;
}
.lang-select select {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #aaa;
}
</style>
