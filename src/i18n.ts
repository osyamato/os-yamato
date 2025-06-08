// src/i18n.ts
import { createI18n } from 'vue-i18n'
import ja from './locales/ja.json'
import en from './locales/en.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'ja', // 初期値（後で Cognito から上書き）
  fallbackLocale: 'ja',
  messages: {
    ja,
    en
  }
})
