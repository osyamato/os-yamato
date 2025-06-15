<template>
<div class="wind-container">

  <div class="wind-inbox-view">
<div class="title-with-icon">
<h2 class="header-title">{{ t('wind.inboxTitle') }}</h2>
  <div class="heart-button-wrapper">
<IconButton
  :color="selectedColor"
  :class="{ favorited: showFavoritesOnly }"
  @click="toggleFavoriteFilter"
>
  <span class="heart-icon">♡</span>
</IconButton>
  </div>
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
  📬 {{ t('wind.receiveButton') }}
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
  {{ t('wind.fromDisplayName', { name: msg.fromDisplayName }) }}
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
      <button class="delete-button" @click="promptDeleteMessage(selectedMessage.id)">⋯</button>
      <button class="favorite-button" @click="toggleFavorite(selectedMessage)">
        <span :class="{ 'favorited': selectedMessage?.favoriteByReceiver }">♡</span>
      </button>

<h3 class="letter-title">{{ t('wind.title') }}</h3>   

      <div class="letter-content">
        <p class="letter-body">{{ selectedMessage.content }}</p>
<div class="signature">
   {{ t('wind.fromDisplayName', { name: selectedMessage.fromDisplayName }) }}<br />
  {{ formatDate(selectedMessage.deliveryDate) }}
</div>
      </div>
    </div>
  </div>
</Transition>
<ConfirmDialog
  :visible="showConfirm"
  :message="confirmMessage"
  @confirm="handleConfirmedDelete"
  @cancel="cancelDeleteMessage"
/>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { listWindMessages } from '@/graphql/queries'
import { updateWindMessage } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'

import ConfirmDialog from '@/components/ConfirmDialog.vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

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

const showConfirm = ref(false)
const confirmMessage = ref('')
const pendingDeleteId = ref(null)
function promptDeleteMessage(id) {
  confirmMessage.value = 'この便りを削除しますか？'
  pendingDeleteId.value = id
  showConfirm.value = true
}

async function handleConfirmedDelete() {
  if (!pendingDeleteId.value) return
  try {
    await API.graphql(graphqlOperation(updateWindMessage, {
      input: {
        id: pendingDeleteId.value,
        deletedByReceiver: true
      }
    }))
    openedMessages.value = openedMessages.value.filter(msg => msg.id !== pendingDeleteId.value)
    selectedMessage.value = null
  } catch (e) {
    console.error("🗑️ 削除失敗:", e)
  } finally {
    showConfirm.value = false
    pendingDeleteId.value = null
  }
}

function cancelDeleteMessage() {
  showConfirm.value = false
  pendingDeleteId.value = null
}

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
.wind-container {
  max-width: 100%;
  padding: 2rem;
  text-align: center;
}
.wind-inbox-view {
  margin: 0 auto;
  width: fit-content;
  animation: dropDownCentered 0.6s ease-out;
}

@keyframes dropDownCentered {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

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
  z-index: 2;
  transform: translate(-50%, -50%);
  animation: flutter 6s ease-in-out infinite;
}
@keyframes flutter {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  20% { transform: translate(-46%, -60%) rotate(10deg); }
  40% { transform: translate(-54%, -40%) rotate(-12deg); }
  60% { transform: translate(-45%, -58%) rotate(8deg); }
  80% { transform: translate(-53%, -42%) rotate(-6deg); }
  100% { transform: translate(-50%, -50%) rotate(0deg); }
}

.receive-button-area { margin-bottom: 2rem; }

.message-list {
  margin-top: 1rem;
  padding: 0;
  list-style: none;
}

.wind-message {
  background: rgba(255, 255, 245, 0.8);
  padding: 1.2rem;
  margin-bottom: 1.2rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  border: 1px solid #e0dcc8;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.04);
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 4px);
  background-blend-mode: overlay;
  font-family: 'serif';
}
.wind-message:hover {
  background: rgba(255, 255, 255, 0.08);
}

.wind-list {
  padding: 1rem;
  list-style: none;
  margin-top: 1rem;
}

.wind-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;  /* ← 名前とFromを左右に振りたいなら */
  background-color: #fdfaf3;
  padding: 1rem 1.5rem;
  position: relative;
  margin: 0 auto 1rem;              /* ✅ 中央寄せ + 下マージン */
  width: 100%;
  max-width: 230px;                /* ✅ カードの最大幅（調整可） */
  min-width: 200px;                /* 任意：狭すぎを防止 */
  border: 1.5px solid #ddd;
  border-radius: 4px;
  font-family: 'serif';
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
  bottom: -20px;
  right: -20px;
  font-size: 1.8rem;
  opacity: 0.85;
  pointer-events: none;
  z-index: 10;
  animation: float 3s ease-in-out infinite;
}

.recipient-label {
  margin-right: 0.5rem;
  color: #555;
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Georgia', 'Times New Roman', serif;

  min-width: 60px; /* From: の幅を確保 */
}

.name {
  font-size: 0.95rem;
  font-weight: 160;
  color: #222;

  /* ⬇️ 幅を制限して省略処理 */
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-3px) rotate(-10deg); }
}

.letter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: flex-start; /* ✅ 中央ではなく上揃えに */
  z-index: 1000;
  padding: 8vh 1rem 2rem;  /* ✅ 上下パディングで調整しやすく */
}

.letter-card {
  position: relative;
  /* margin-top: 8vh; ← 削除！ */
  background: #fdfaf3 !important;
  color: #222 !important;
  border: 1px solid #e4ded0;
  border-radius: 0;
  padding: 2rem 2.5rem;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;              /* ⬅ 長すぎる場合にスクロール */
  overflow-y: auto;              /* ⬅ 縦スクロールのみ許可 */
  overflow-x: hidden;            /* ⬅ 横スクロールは完全禁止 */
  word-wrap: break-word;         /* ⬅ 単語途中でも折り返す */
  white-space: normal;           /* ⬅ テキストを折り返す */
  -ms-overflow-style: none;	     /* IE用: スクロールバー非表示 */
  scrollbar-width: none;         /* Firefox用: スクロールバー非表示 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  font-size: 1.05rem;
  line-height: 1.7;
  font-family: 'serif';
}

/* Chrome / Safari 用: スクロールバー非表示 */
.letter-card::-webkit-scrollbar {
  display: none;
}

.letter-title {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 1.2rem;
  margin-top: 0rem; /* ← 追加: 少し上に詰める */
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
.delete-button:hover { color: #222; }

.favorite-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #aaa; /* ← 初期状態をグレイに */
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;
}

/* 押したときに色を淡い赤に */
.favorite-button .favorited {
  color: #e77474; /* ← 押されたときのハート色 */
}

.title-with-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
}
.heart-button-wrapper {
  margin-top: 0.6rem;
}
.under-title-heart {
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  font-size: 1.4rem;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #e6ffe6;
  transition: background-color 0.2s ease, color 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* ✅ 押したときだけ白に */
.under-title-heart.favorited {
  background-color: #fff !important;
}

.under-title-heart.favorited span {
  color: #e77474 !important; /* 押したときのハート色 */
}

.selected-icon {
  background-color: #ffb6c1;
  color: #e77474 !important;
}


/* ✨ Yamato スタイル：上から降りてくる、上に消える */
.fly-enter-active,
.fly-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
  will-change: transform, opacity;
}

.fly-enter-from {
  transform: translateY(-40px);
  opacity: 0;
}
.fly-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.fly-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.fly-leave-to {
  transform: translateY(-40px);
  opacity: 0;
}

@media (prefers-color-scheme: dark) {
  .wind-message { background: rgba(255, 255, 255, 0.05); color: #f0f0f0; }
  .wind-message:hover { background: rgba(255, 255, 255, 0.1); }
  .letter-card { background: #1a1a1a; color: #f2f2f2; }
  .letter-date { color: #aaa; }
}
.letter-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
  position: relative;
}

.signature {
  text-align: right;
  font-size: 0.9rem;
  color: #444;
  margin-top: 2rem;
  white-space: nowrap;
}
.heart-icon {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif !important;
  font-size: 1.4rem;
}

.IconButton.favorited {
  background-color: #fff !important;
}

.IconButton.favorited .heart-icon {
  color: #e77474 !important;
}

button.favorited {
  background-color: #fff !important;
}
button.favorited .heart-icon {
  color: #e77474 !important;
}

</style>
  
 

 
