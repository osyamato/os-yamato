<template>
  <div :class="['icon-guide', { dropDown: shouldAnimate }]">
    <h2>OS Yamatoのヒント</h2>
    <p class="guide-subtitle">ホーム画面にWebサイトのアイコンを追加すると、快適に利用できます。</p>
    <hr class="subtitle-divider" />
    <p class="guide-instruction">アイコンを押して機能を確認してください。</p>

    <!-- 成長ステータス -->
    <div class="icon-flex-grid">
      <div v-for="item in statusIcons" :key="item.emoji" class="icon-container">
        <div
          class="icon-box icon-circle"
          :class="{ active: activeEmoji === item.emoji }"
          @click="toggleDescription(item.emoji)"
        >
          <span class="icon">{{ item.emoji }}</span>
        </div>
        <p v-if="activeEmoji === item.emoji" class="desc-text">{{ item.description }}</p>
      </div>
    </div>

    <!-- その他アイコン -->
    <div class="icon-flex-grid">
      <div v-for="item in otherIcons" :key="item.emoji" class="icon-container">
        <div
          class="icon-box icon-circle"
          :class="{ active: activeEmoji === item.emoji }"
          @click="toggleDescription(item.emoji)"
        >
          <span class="icon">{{ item.emoji }}</span>
        </div>
        <p v-if="activeEmoji === item.emoji" class="desc-text">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { nextTick } from 'vue'

const shouldAnimate = ref(false)
const activeEmoji = ref(null)

const statusIcons = [
  {
    emoji: '🌱',
    description: '命を宿した瞬間。\n静かに芽吹きはじめる、小さなはじまり。'
  },
  {
    emoji: '🌷',
    description: '記録が育ち、花開くとき。\n触れることでさらに咲き誇ります。'
  },
  {
    emoji: '🥀',
    description: '風に還る準備をしています。\n風に還りそうなデータをまとめて確認できます。\n（365日経過するとデータが消えます）'
  },
]

const otherIcons = [
  { emoji: '🏷️', description: 'カレンダーのテンプレートを登録して、予定作成を簡単に。' },
  { emoji: '＋', description: '新規メモや写真などを追加します。' },
  { emoji: '🗑️', description: 'データを消去します。' },
  { emoji: '☑️', description: '複数項目を選択できます。' },
  { emoji: '↓', description: '写真やメモなどをローカルにダウンロードします。' },
  { emoji: '♡', description: 'お気に入り追加。お気に入り一覧をまとめて確認できます。' },
  { emoji: '🔍', description: 'メッセージ相手やメモ、連絡先などを検索します。' },
  { emoji: '✉️', description: '相手に風のたよりを送ります。' },
  { emoji: '🕊️', description: '風のたよりのメッセージの編集画面です。' },
  { emoji: '📮', description: '相手にメッセージのやり取りを申請します。' },
  { emoji: '☁️', description: 'メッセージ相手をブロックします。' },
  { emoji: '...', description: 'ブロックや削除などの追加操作メニュー。' },
  { emoji: '🎞️', description: 'メッセージ送受信の写真を保存します。' },
]

function toggleDescription(emoji) {
  activeEmoji.value = activeEmoji.value === emoji ? null : emoji
}

onMounted(async () => {
  window.scrollTo(0, 0)
  await nextTick()
  shouldAnimate.value = true
})
</script>

<style scoped>
.icon-guide {
  padding: 2rem 1rem;
}

h2 {
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1.2rem; /* ✅ タイトル下に少し隙間追加 */
}

@media (prefers-color-scheme: dark) {
  h2 {
    color: #fff;
  }
}

.icon-flex-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.2rem;
  margin-bottom: 1rem;
}

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-box {
  width: 48px;
  height: 48px;
  font-size: 1.6rem;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #aaa;
  transition: transform 0.15s, background-color 0.15s;
  cursor: pointer;
}

.icon-circle:hover {
  transform: scale(1.1);
}

.icon-circle.active {
  background-color: #274c77;
  color: #fff;
}

.desc-text {
  text-align: center;
  white-space: pre-wrap;
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.5rem;
  max-width: 120px;
}

@media (prefers-color-scheme: dark) {
  .desc-text {
    color: #ccc;
  }
}

.guide-subtitle {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  margin-top: -0.5rem; /* ✅ 少しだけ上詰め調整 */
  margin-bottom: 0.5rem;
}

.subtitle-divider {
  border: none;
  border-top: 1px solid #aaa;
  margin: 1rem auto;
  width: 60%;
}

.guide-instruction {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1.5rem;
}

@media (prefers-color-scheme: dark) {
  .guide-subtitle,
  .guide-instruction {
    color: #ccc;
  }
}

/* ✅ dropDown アニメーション */
.icon-guide.dropDown {
  animation: dropDown 0.6s ease-out forwards;
}

@keyframes dropDown {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>


