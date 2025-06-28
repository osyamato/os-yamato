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
        <option value="ja">日本語</option>
        <option value="en">English</option>
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

    <section>
      <h3>{{ $t('about.contactTitle') }}</h3>
      <p>{{ $t('about.developer') }}: 倉岡剛 Tsuyoshi Kuraoka</p>
      <p>Email: support-weather@hanaco875.com</p>
      <p>
        GitHub:
        <a href="https://github.com/osyamato/os-yamato" target="_blank">
          osyamato/os-yamato
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
</style>


