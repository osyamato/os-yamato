import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import { Amplify } from 'aws-amplify'
import awsconfig from './aws-exports'

// ✅ 追加：i18n をインポート
import { i18n } from './i18n'

Amplify.configure(awsconfig)

const app = createApp(App)

// ✅ 各種プラグインを登録
app.use(i18n)          // ← 🌐 ここが重要！
app.use(createPinia())
app.use(router)

app.mount('#app')

