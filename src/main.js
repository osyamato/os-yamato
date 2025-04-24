import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// ✅ ここから Amplify を追加
import { Amplify } from 'aws-amplify'
import awsconfig from './aws-exports'
Amplify.configure(awsconfig) // ← これが超重要！
 
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
