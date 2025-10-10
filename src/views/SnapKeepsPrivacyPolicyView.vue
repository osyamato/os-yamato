<template>
  <div class="snapkeeps-page">
    <!-- 🌸 SnapKeepsについて -->
    <section class="section">
      <h1 class="page-title">{{ $t('about_title') }}</h1>

      <!-- 🌐 言語セレクター -->
      <div class="language-selector">
        <select v-model="selectedLanguage" @change="changeLanguage" id="language">
          <option value="ja">{{ t('japanese') }}</option>
          <option value="en">{{ t('english') }}</option>
        </select>
      </div>

      <p>{{ $t('about_description1') }}</p>
      <p>{{ $t('about_description2') }}</p>
    </section>

    <hr class="divider" />

    <!-- 🔐 プライバシーポリシー -->
    <section class="section">
      <h2 class="section-title">{{ $t('privacy_title') }}</h2>
      <p>{{ $t('privacy_description1') }}</p>
      <p>{{ $t('privacy_description2') }}</p>
      <p>{{ $t('privacy_description3') }}</p>
      <p>{{ $t('privacy_description4') }}</p>
    </section>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { t, locale } = useI18n()
const selectedLanguage = ref(locale.value)

const changeLanguage = () => {
  locale.value = selectedLanguage.value
}
</script>

<style scoped>
.snapkeeps-page {
  max-width: 720px;
  margin: 2rem auto;
  padding: 1.5rem;
  line-height: 1.8;
  font-size: 1rem;
  color: var(--text-color, #222);
  font-family: "Hiragino Sans", "Noto Sans JP", sans-serif;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.section p {
  margin-bottom: 1rem;
}

.divider {
  border: none;
  border-top: 1px solid #ddd;
  margin: 2rem 0;
}

.contact {
  margin-top: 1.5rem;
  font-style: italic;
  color: #555;
}

.language-selector {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
