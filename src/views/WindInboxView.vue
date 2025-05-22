<template>
  <div class="wind-inbox-view">
<div class="title-with-icon">
  <h2 class="title">届いた風の便り</h2>
<IconButton
  :color="selectedColor"
  :class="{ 'selected-icon': showFavoritesOnly }"
  @click="toggleFavoriteFilter"
>
  ♡
</IconButton>

 </div>
    <!-- 🦋 ポストと蝶 -->
    <div class="post-butterfly-area">
      <img src="/Post.png" alt="Post Icon" class="post-image" />
      <div
        v-for="(msg, i) in unopenedMessages"
        :key="msg.id"
        class="butterfly"
        :style="getButterflyStyle(i, unopenedMessages.length)"
      >
        🦋
      </div>
    </div>

    <!-- 📬 開封ボタン -->
    <div class="receive-button-area">
      <YamatoButton v-if="unopenedMessages.length > 0" @click="receiveMessages">
        📬 便りを受け取る
      </YamatoButton>
    </div>

    <!-- ✅ openedMessages を ul 内で描画 -->
<ul class="wind-list">
  <li
    v-for="msg in filteredOpenedMessages"
    :key="msg.id"
    class="wind-list-item"
    @click="openModal(msg)"
  >
    <span class="recipient-label">
      <span v-if="isWilting(msg)">🥀</span>
      From:
    </span>
    <span class="name">{{ msg.fromDisplayName }}</span>
  </li>
</ul>

    <!-- 🆕 受信直後の開封メッセージ（名前だけ） -->
    <ul v-if="showLetters" class="message-list">
      <li
        v-for="msg in unopenedMessages"
        :key="msg.id"
        class="wind-message clickable"
        @click="openModal(msg)"
      >
        {{ msg.fromDisplayName }} より
      </li>
    </ul>


    <!-- ✨ 手紙風モーダル：文面を表示 -->
<Transition name="fly">
  <div
    v-if="selectedMessage"
    class="letter-overlay"
    @click.self="selectedMessage = null"
  >
    <div class="letter-card">

      <!-- ✅ ここに追加：右上 ⋯ ボタン -->

      <button class="delete-button" @click="deleteMessage(selectedMessage.id)">
        ⋯
      </button>
<button class="favorite-button" @click="toggleFavorite(selectedMessage)">
  <span :class="{ 'favorited': selectedMessage?.favoriteByReceiver }">♡</span>
</button>

      <h3 class="letter-title">風の便り</h3>
      <p class="letter-body">{{ selectedMessage.content }}</p>

      <div class="letter-footer">
        <p class="from">{{ selectedMessage.fromDisplayName }} より</p>
        <p class="date">{{ formatDate(selectedMessage.deliveryDate) }}</p>
      </div>
    </div>
  </div>
</Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { listWindMessages } from '@/graphql/queries'
import { updateWindMessage } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'

const selectedColor = ref('#274c77')

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  selectedColor.value = user.attributes['custom:iconColor'] || '#274c77'
})


const messages = ref([])
const showLetters = ref(false)

const unopenedMessages = ref([])
const openedMessages = ref([])

const selectedMessage = ref(null)
const showModal = ref(false)


function closeModal() {
  selectedMessage.value = null
  showModal.value = false
}

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    const mySub = user.attributes.sub
    const today = new Date().toISOString()

    const res = await API.graphql(graphqlOperation(listWindMessages, {
      filter: {
        toUserId: { eq: mySub },
        deliveryDate: { le: today },
        deletedByReceiver: { ne: true }
      },
      limit: 50
    }))

    const items = res.data?.listWindMessages?.items || []

    messages.value = items.map(msg => ({
      ...msg,
      fromDisplayName: msg.fromDisplayName || '匿名'
    }))

    unopenedMessages.value = messages.value.filter(msg => !msg.isOpened)
    openedMessages.value = messages.value.filter(msg => msg.isOpened)
  } catch (e) {
    console.error('📨 WindMessage 読み込み失敗:', e)
  }
})

function receiveMessages() {
  showLetters.value = true;

  unopenedMessages.value.forEach(async (msg) => {
    if (!msg.isOpened) {
      await API.graphql(graphqlOperation(updateWindMessage, {
        input: {
          id: msg.id,
          isOpened: true,
          openedAt: new Date().toISOString(),
        }
      }));
    }
  });

  openedMessages.value = [...openedMessages.value, ...unopenedMessages.value];
  unopenedMessages.value = [];
}

async function openModal(msg) {
  selectedMessage.value = msg
  showModal.value = true

  const now = Date.now()
  const newTTL = Math.floor(now / 1000) + 365 * 24 * 60 * 60

  try {
    await API.graphql(graphqlOperation(updateWindMessage, {
      input: {
        id: msg.id,
        ttl: newTTL,
        ...(msg.isOpened ? {} : {
          isOpened: true,
          openedAt: new Date(now).toISOString()
        })
      }
    }))

    // ✅ ローカル状態も更新
    msg.ttl = newTTL
    if (!msg.isOpened) {
      msg.isOpened = true
      msg.openedAt = new Date(now).toISOString()
    }

    // 🔁 再描画トリガー
    openedMessages.value = [...openedMessages.value]
  } catch (e) {
    console.error("📨 TTL 延命失敗:", e)
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ja-JP')
}

function isWilting(msg) {
  const now = Math.floor(Date.now() / 1000); // 秒
  return msg.ttl && now > (msg.ttl - 30 * 24 * 60 * 60); // 30日前
}

function getButterflyStyle(index) {
  const angle = Math.random() * 360
  const radius = 60 + Math.random() * 20
  const x = radius * Math.cos((angle * Math.PI) / 180)
  const y = radius * Math.sin((angle * Math.PI) / 180)

  const duration = 5 + Math.random() * 3  // 5〜8秒
  const delay = Math.random() * 3        // 0〜3秒

  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animation: `flutter ${duration}s ease-in-out ${delay}s infinite`
  }
}

async function deleteMessage(id) {
  const confirmed = confirm("この便りを削除しますか？");
  if (!confirmed) return;

  try {
    await API.graphql(graphqlOperation(updateWindMessage, {
      input: {
        id,
        deletedByReceiver: true
      }
    }));
    openedMessages.value = openedMessages.value.filter(msg => msg.id !== id);
    selectedMessage.value = null;
  } catch (e) {
    console.error("🗑️ 削除失敗:", e);
  }
}

async function toggleFavorite(msg) {
  const newValue = !msg.favoriteByReceiver

  try {
    await API.graphql(graphqlOperation(updateWindMessage, {
      input: {
        id: msg.id,
        favoriteByReceiver: newValue
      }
    }))
    msg.favoriteByReceiver = newValue // ローカルにも即反映
  } catch (e) {
    console.error('💔 ハート切り替え失敗:', e)
  }
}

const showFavoritesOnly = ref(false)

function toggleFavoriteFilter() {
  showFavoritesOnly.value = !showFavoritesOnly.value
}

const filteredOpenedMessages = computed(() =>
  openedMessages.value.filter(msg => {
    if (showFavoritesOnly.value && !msg.favoriteByReceiver) return false
    return true
  })
)

</script>

<style>
.wind-inbox-view { padding: 2rem; text-align: center; font-family: var(--yamato-font-body); position: relative; overflow: hidden; }

.header-title {
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #000;
  text-align: center;
}
@media (prefers-color-scheme: dark) {
  .header-title {
    color: #fff;
  }
}

.post-butterfly-area {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.post-image {
  width: 120px;
  height: auto;
  z-index: 1;
  position: relative;
}

.butterfly {
  position: absolute;
  font-size: 1.6rem;
  pointer-events: none;
  z-index: 2; /* ポストより上に表示 */
  transform: translate(-50%, -50%);
  animation: flutter 6s ease-in-out infinite;
}
@keyframes flutter {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  20%  { transform: translate(-46%, -60%) rotate(10deg); }
  40%  { transform: translate(-54%, -40%) rotate(-12deg); }
  60%  { transform: translate(-45%, -58%) rotate(8deg); }
  80%  { transform: translate(-53%, -42%) rotate(-6deg); }
  100% { transform: translate(-50%, -50%) rotate(0deg); }
}
.receive-button-area { margin-bottom: 2rem; }
.message-list { margin-top: 1rem; padding: 0; list-style: none; }
.wind-message { background: rgba(255, 255, 255, 0.05); padding: 1rem; margin-bottom: 1rem; border-radius: 1rem; cursor: pointer; transition: background 0.3s; }
.wind-message:hover { background: rgba(255, 255, 255, 0.08); }

.letter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 8vh;
  z-index: 1000;
}

.letter-card {
  background: #fdfaf3 !important;   /* 明るい封筒色、ダークモードでも強制 */
  color: #222 !important;           /* 文字は濃くて読みやすく */
  border: 1px solid #e4ded0;        /* 封筒の縁っぽい明るい枠線 */
  border-radius: 0;                 /* ✅ 角ばった便箋風 */
  padding: 2rem 2.5rem;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  font-size: 1.05rem;
  line-height: 1.7;
  font-family: 'serif';
  position: relative;
}
.letter-title {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 1.2rem;
  text-align: center;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.letter-body {
  font-size: 1.05rem;
  margin-bottom: 3rem;
  white-space: pre-wrap;
  color: #222;
}
.letter-footer {
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
  text-align: right;
  font-size: 0.95rem;
  color: #444;
  line-height: 1.4;
}

.letter-footer .from {
  display: block;
  font-weight: 500;
  margin-bottom: 0.3rem;
}

.letter-footer .date {
  display: block;
  font-size: 0.9rem;
  color: #666;
}
.delete-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #999;
  cursor: pointer;
  transition: color 0.2s ease;
}
.delete-button:hover {
  color: #222;
}

@keyframes dropDown { 0% { transform: translateY(-40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

@media (prefers-color-scheme: dark) {
  .wind-message { background: rgba(255, 255, 255, 0.05); color: #f0f0f0; }
  .wind-message:hover { background: rgba(255, 255, 255, 0.1); }
  .letter-card { background: #1a1a1a; color: #f2f2f2; box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05); }
  .letter-date { color: #aaa; }
}
.fly-enter-active {
  animation: dropDown 0.4s ease-out;
}
.fly-leave-active {
  animation: flyUp 0.3s ease-in;
}

@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
.wind-message {
  background: rgba(255, 255, 245, 0.8); /* 少し黄味がかった和紙風 */
  padding: 1.2rem;
  margin-bottom: 1.2rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  border: 1px solid #e0dcc8; /* 和紙の縁取り色 */

  /* ✅ 和紙の質感に近づけるためのテクスチャ風影 */
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.04);

  /* ✅ 背景に微細なパターン（SVGや和紙画像を使う場合はここで） */
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 4px);
  background-blend-mode: overlay;

  font-family: 'serif'; /* より筆記感のあるフォントに */
}

.wind-list {
  padding: 1rem;
  list-style: none;
  margin-top: 1rem;
}
.wind-list-item {
  display: flex;
  align-items: center;
  background-color: #fdfaf3; /* 少し黄みを足して和紙感を強化 */
  padding: 1rem 1.5rem;
  position: relative; 
  margin-bottom: 1rem;
  border: 1.5px solid #ddd;
  border-radius: 4px;
  font-family: 'serif';

  /* 👇 縦線を太く＆濃くして明瞭に */
  background-image: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.08) 0px,
    rgba(0, 0, 0, 0.08) 2px,
    transparent 2px,
    transparent 7px
  );

  background-blend-mode: overlay;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s, background 0.3s;
  cursor: pointer;
}
.wind-list-item::after {
  content: "🕊️";
  position: absolute;
  bottom: -20px;       /* さらに下へ */
  right: -20px;        /* さらに右へ */
  font-size: 1.8rem;   /* 少し大きめで存在感 */
  opacity: 0.85;
  pointer-events: none;
  z-index: 10;         /* 🕊️ を前面に */
}

.wind-list-item:hover {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recipient-label {
  margin-right: 0.5rem;
  color: #555;
  font-style: normal;              /* ← 斜体を解除 */
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(-10deg);
  }
  50% {
    transform: translateY(-3px) rotate(-10deg);
  }
}

.wind-list-item::after {
  animation: float 3s ease-in-out infinite;
}

/* 🌙 ダークモード用に上書き */
@media (prefers-color-scheme: dark) {
  .wind-list-item {
    background-color: #fdfaf3; /* 明るい封筒色をキープ */
    color: #222;               /* テキストを黒に */
  }

  .recipient-label,
  .name {
    color: #222; /* ← 明示的に黒に指定（デフォルト白を上書き） */
  }

  .wind-list-item::after {
    filter: none; /* 🕊️が白背景で見えすぎる場合は調整 */
  }
}

.favorite-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #aaa;
  cursor: pointer;
  transition: color 0.3s ease;
}

.favorite-button .favorited {
  color: #e77474; /* 淡い赤 */
}
.title-with-icon {
  display: flex;
  flex-direction: column;  /* ← 横並びを縦並びにする */
  align-items: center;
  margin-bottom: 1.5rem;
}

.icon-circle {
  background-color: #1c355e;
  color: white;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 1.3rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.3s, transform 0.2s;
}
.icon-circle:hover {
  background-color: #274c77;
  transform: scale(1.05);
}
.selected-icon {
  background-color: #ffb6c1;
  color: #e77474 !important;  /* ← ここが重要 */
}

.favorited {
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

</style>
