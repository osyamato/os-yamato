<template>
  <div class="about-view">
    <h2>{{ $t('about.title') }}</h2>

    <div class="logo-wrapper">
      <!-- ロゴ画像 (フェードイン) -->
      <img
        src="/os_yamato01.png"
        alt="OS Yamato Logo"
        class="logo-image"
        @load="handleLoad"
        :class="{ 'visible': logoLoaded }"
      />
    </div>

    <!-- 🌐 言語ピッカー -->
<div class="lang-picker">
  <label for="language">🌐 {{ $t('about.language') }}</label>
  <select id="language" v-model="currentLang" @change="changeLanguage">
    <option value="ja">{{ $t('japanese') }}</option>
    <option value="en">{{ $t('english') }}</option>
    <option value="es">{{ $t('spanish') }}</option>   <!-- 🇪🇸 -->
    <option value="zh">{{ $t('chinese') }}</option>
    <option value="fr">{{ $t('french') }}</option>    <!-- 🇫🇷 -->
    <option value="id">{{ $t('indonesian') }}</option> <!-- 🇮🇩 追加 -->
  </select>
</div>

    <section>
      <h3>{{ $t('about.conceptTitle') }}</h3>
      <p>{{ $t('about.conceptText') }}</p>
    </section>

    <section>
      <h3>{{ $t('about.featuresTitle') }}</h3>
      <ul>
        <li>{{ $t('about.feature.diary') }}</li>
        <li>{{ $t('about.feature.calendar') }}</li>
        <li>{{ $t('about.feature.chat') }}</li>
        <li>{{ $t('about.feature.memo') }}</li>
        <li>{{ $t('about.feature.photo') }}</li>
      </ul>
    </section>

    <section>
      <h3>{{ $t('about.termsTitle') }}</h3>
      <p>
        <a href="#" @click.prevent="showTerms = true">
          {{ $t('about.termsText') }}
        </a>
      </p>
    </section>

    <section>
      <h3>{{ $t('about.premiumTitle') }}</h3>
      <p>
        <a href="#" @click.prevent="showPremium = true">
          {{ $t('about.premiumLink') }}
        </a>
      </p>
    </section>

<section @click="goToSnapkeeps" class="snapkeeps-section">
  <h3 class="snapkeeps-link">
    SnapKeeps(iOS App)
    <span class="snapkeeps-arrow">→</span>
  </h3>
</section>

<section @click="goToHanacoGarden" class="snapkeeps-section">
  <h3 class="snapkeeps-link">
    {{ $t('about.hanacoGarden') }}
    <span class="snapkeeps-arrow">→</span>
  </h3>
</section>

<!-- 🌤 花子天気 -->
<section @click="goToHanacoWeather" class="snapkeeps-section">
  <h3 class="snapkeeps-link">
    {{ $t('about.hanacoWeather') }}
    <span class="snapkeeps-arrow">→</span>
  </h3>
</section>

<section>
  <h3>{{ $t('about.contactTitle') }}</h3>
  <p>{{ $t('about.developer') }}: OS Yamato (Japan)</p>
<p>
  Email:
  <a href="mailto:support-weather@hanaco875.com">
    support-weather@hanaco875.com
  </a>
</p>
  <p>
    Website:
    <a href="https://hanaco875.com" target="_blank">
      https://hanaco875.com
    </a>
  </p>
  <p>
    GitHub:
    <a href="https://github.com/osyamato/os-yamato" target="_blank">
      osyamato/os-yamato
    </a>
  </p>
  <p>
    X (Twitter):
    <a href="https://x.com/Yamato_OS" target="_blank">
      @Yamato_OS
    </a>
  </p>
</section>

    <!-- ✅ モーダル -->
    <TermsModal :visible="showTerms" @close="showTerms = false" />
    <PremiumModal :visible="showPremium" @close="showPremium = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TermsModal from '@/components/TermsModal.vue'
import PremiumModal from '@/components/PremiumModal.vue'

import { useRouter } from 'vue-router'
const router = useRouter()

const goToSnapkeeps = () => {
  router.push('/snapkeeps-privacy') // 必要に応じてルート名に変更
}

const goToHanacoGarden = () => {
  router.push('/privacy') // PrivacyView.vue のルート
}

const goToHanacoWeather = () => {
  window.open(
    'https://apps.apple.com/app/%E8%8A%B1%E5%AD%90%E5%A4%A9%E6%B0%97/id6740754478',
    '_blank'
  )
}

const showPremium = ref(false)
const showTerms = ref(false)

const logoLoaded = ref(false)
const handleLoad = () => {
  logoLoaded.value = true
}

const { locale } = useI18n()
const currentLang = ref(locale.value)

const changeLanguage = () => {
  locale.value = currentLang.value
}
</script>

<style scoped>
.about-view {
  padding: 2rem;
  animation: dropDown 0.6s ease;
}

@keyframes dropDown {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

h2 {
  font-size: 1.6rem;
  margin-bottom: 1rem;
  text-align: center;
}

.lang-picker {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

select {
  margin-left: 0.5rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

section {
  margin-bottom: 2rem;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

ul {
  padding-left: 1.2rem;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: var(--yamato-primary);
  text-decoration: underline;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  min-height: 100px; /* ロゴの高さを確保 */
}

.logo-image {
  max-width: 100px;
  height: auto;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.logo-image.visible {
  opacity: 1;
}

.snapkeeps-section {
  cursor: pointer;
  margin-bottom: 2rem;
}

.snapkeeps-link {
  font-size: 1.2rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: black; /* デフォルト（ライトモード） */
}

/* 🌙 ダークモード用：SnapKeeps を白に */
@media (prefers-color-scheme: dark) {
  .snapkeeps-link {
    color: white;
  }
}

.snapkeeps-arrow {
  background-color: var(--yamato-primary);
  color: white;
  font-size: 1.2rem;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>


