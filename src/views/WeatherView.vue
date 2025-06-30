<template>
  <div class="weather-view">
    <h2 class="weather-title">{{ t('weather.title') }}</h2>
    <p class="weather-text">
      {{ t('weather.text') }}
    </p>
    <a
      href="https://apps.apple.com/jp/app/%E8%8A%B1%E5%AD%90%E5%A4%A9%E6%B0%97/id6740754478"
      class="app-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ t('weather.appLink') }}
    </a>
  </div>
</template>


<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.weather-view {
  padding: 2rem;
  text-align: center;
  animation: dropDown 0.6s ease-out forwards;
}

.weather-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.weather-text {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.app-link {
  font-size: 0.95rem;
  color: #007aff;
  text-decoration: underline;
}

.app-link:hover {
  color: #005ecb;
}

@media (prefers-color-scheme: dark) {
  .weather-text {
    color: #ccc;
  }
  .app-link {
    color: #80bfff;
  }
  .app-link:hover {
    color: #66aaff;
  }
}

@keyframes dropDown {
  0% { transform: translateY(-30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>

