<template>
  <!-- 通常の送信画面 -->
<div v-if="!sent" class="wind-message-view drop-down" v-show="recipientLoaded">
    <h2 class="animated-title">
      {{ recipientName ? `${recipientName}さんの未来へ言葉を届けよう` : '未来へ言葉を届けよう' }}
    </h2>
    <p class="subtitle">言葉を風に乗せて、静かに届くその日まで。</p>

    <div class="letter-box">
      <textarea
        v-model="message"
        placeholder="ここに想いを綴ってください…"
        rows="8"
        class="textarea"
      />
    </div>

    <YamatoButton @click="sendMessage" :disabled="!message.trim()">🕊️ 風に預ける</YamatoButton>
  </div>

  <!-- 送信アニメーション画面 -->
  <div v-else class="animation-overlay">
    <div class="bird fly">🕊️</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { getPublicProfile } from '@/graphql/queries'
import { createWindMessage } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'

const route = useRoute()
const router = useRouter()

const toUserId = route.query.toUserId
const toDisplayName = route.query.toDisplayName // ✅ 追加でニックネーム取得

const message = ref('')
const recipientName = ref(toDisplayName || '')  // ✅ デフォルトで設定
const sent = ref(false)
const recipientLoaded = ref(true)  // ✅ GraphQL読み込みが不要なら true 固定

onMounted(async () => {
  if (!toUserId) return
  try {
    const res = await API.graphql(graphqlOperation(getPublicProfile, { id: toUserId }))
    recipientName.value = res.data.getPublicProfile?.displayName || ''
  } catch (e) {
    console.warn('⚠️ 宛先プロフィール取得失敗:', e)
  } finally {
    recipientLoaded.value = true  // ✅ 表示許可をここで与える
  }
})

function getRandomFutureDate() {
  const days = Math.floor(Math.random() * 90) + 90
  return new Date(Date.now() + days * 86400000)
}

async function sendMessage() {
  if (!message.value.trim() || !toUserId) return
  try {
    const user = await Auth.currentAuthenticatedUser()
    const fromUserId = user.attributes.sub

    const profileRes = await API.graphql(graphqlOperation(getPublicProfile, { id: fromUserId }))
    const fromDisplayName = profileRes.data.getPublicProfile?.displayName || '匿名'

    const delivery = getRandomFutureDate()
    const ttl = Math.floor(delivery.getTime() / 1000 + 365 * 24 * 60 * 60) // TTLとして1年後（UNIX秒）

    const input = {
      fromUserId,
      fromDisplayName,
      toUserId,
      content: message.value,
      deliveryDate: delivery.toISOString(),
      isOpened: false,
      ttl // ✅ 正しいフィールド名に修正
    }

    await API.graphql(graphqlOperation(createWindMessage, { input }))
    sent.value = true
    setTimeout(() => router.push('/chat-rooms'), 4000)
  } catch (err) {
    console.error('❌ WindMessage 送信失敗:', err)
  }
}

</script>

<style scoped>
.wind-message-view {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  font-family: var(--yamato-font-body);
  text-align: center;
}

.drop-down {
  animation: dropDown 0.5s ease-out;
}

@keyframes dropDown {
  0% { opacity: 0; transform: translateY(-40px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animated-title {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
  color: var(--yamato-primary);
  font-family: var(--yamato-font-title);
}

.subtitle {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #666;
}

.letter-box {
  background: #fff;
  border: 1px solid var(--yamato-border);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: var(--yamato-shadow);
  margin-bottom: 1.5rem;
}

.textarea {
  width: 100%;
  font-size: 1rem;
  border: none;
  outline: none;
  resize: none; /* ✅ リサイズ無効化（自然な表示のため） */
  height: 180px; /* ✅ 明示的な高さで「かくっ」を防止 */
  font-family: var(--yamato-font-body);
  background: transparent;
  color: inherit;
}
.animation-overlay {
  position: fixed;
  inset: 0;
background: linear-gradient(to top, #e0f2ff, #b3e5fc);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 999;
}

.bird {
  font-size: 3rem;
  position: absolute;
  bottom: 30px;
  right: 30px;
}

.fly {
  animation: flyAway 3s ease forwards;
}

@keyframes flyAway {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-80vw, -80vh) scale(0.5);
    opacity: 0;
  }
}

.yamato-button {
  white-space: nowrap;        /* 改行を防ぐ */
  min-width: 160px;           /* 適切な最小幅を設定 */
  padding: 0.6rem 1.4rem;     /* パディング調整 */
  font-size: 1rem;            /* 必要に応じて調整 */
  text-align: center;
}

@keyframes fall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
}
@media (prefers-color-scheme: dark) {
  .letter-box {
    background: #2a2a2a; /* ✅ 背景のグレー */
    border: 1px solid #444;
  }

  .textarea {
    background: transparent; /* ✅ 親がグレーなので透明でOK */
    color: #f5f5f5;
  }

  .animated-title,
  .subtitle {
    color: #ddd;
  }
}
@media (prefers-color-scheme: dark) {
  .wind-message {
    background: rgba(255, 255, 255, 0.05);
    color: #f0f0f0;
    border: none; /* ✅ 枠線なしでOK */
    box-shadow: none;
  }
}

</style>
 
