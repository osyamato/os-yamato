<template>
  <div :class="['icon-guide', { dropDown: shouldAnimate }]">
    <h2>{{ $t('iconGuide.title') }}</h2>

    <p class="guide-access">
      {{ $t('iconGuide.access') }}
    </p>

    <p class="guide-subtitle">
      {{ $t('iconGuide.subtitle') }}
    </p>

<div class="guide-icon-wrapper">
  <img src="/icons/icon-192x192.png" alt="OS Yamato Icon" class="guide-icon" />
</div>

    <hr class="subtitle-divider" />
    <p class="guide-instruction">{{ $t('iconGuide.instruction') }}</p>

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
import { useI18n } from 'vue-i18n'

const shouldAnimate = ref(false)
const activeEmoji = ref(null)

const { t } = useI18n()

const statusIcons = [
  {
    emoji: '🌱',
    description: t('iconGuide.statusSprout')
  },
  {
    emoji: '🌷',
    description: t('iconGuide.statusBloom')
  },
  {
    emoji: '🥀',
    description: t('iconGuide.statusWither')
  },
]

const otherIcons = [
  { emoji: '＋', description: t('iconGuide.plus') },
  { emoji: '↓', description: t('iconGuide.download') },
  { emoji: '♡', description: t('iconGuide.favorite') },
  { emoji: '...', description: t('iconGuide.more') },
  { emoji: '🏷️', description: t('iconGuide.template') },
  { emoji: '🗑️', description: t('iconGuide.delete') },
  { emoji: '☑️', description: t('iconGuide.multiSelect') },
  { emoji: '🔍', description: t('iconGuide.search') },
  { emoji: '✉️', description: t('iconGuide.sendWind') },
  { emoji: '🕊️', description: t('iconGuide.editWind') },
  { emoji: '📮', description: t('iconGuide.request') },
  { emoji: '☁️', description: t('iconGuide.blockList') },
  { emoji: '🎞️', description: t('iconGuide.savePhoto') },
  { emoji: '👤', description: t('iconGuide.profile') },
  { emoji: '📎', description: t('iconGuide.upload') }, // ✅ ← 追加
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
 white-space: pre-wrap; 
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

.guide-access {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  margin-top: -0.5rem;
  margin-bottom: 1.5rem;
  word-break: break-all; /* URLが長い場合に折返し */
 white-space: pre-wrap; 
 }

@media (prefers-color-scheme: dark) {
  .guide-access {
    color: #ccc;
  }
}

.guide-icon-wrapper {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.guide-icon {
  width: 70px; /* ✅ サイズ調整自由 */
  height: 70px;
  border-radius: 50%; /* 丸くする */
}

</style>


