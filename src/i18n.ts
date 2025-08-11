// src/i18n.ts
import { createI18n } from 'vue-i18n'
import ja from './locales/ja.json'
import en from './locales/en.json'
import zh from './locales/zh.json'
import es from './locales/es.json'
import fr from './locales/fr.json' // ✅ フランス語を追加

export const i18n = createI18n({
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'ja',
  messages: {
    ja,
    en,
    zh,
    es,
    fr // ✅ ここも忘れず追加
  }
})

