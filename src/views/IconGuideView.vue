<template>
  <div :class="['icon-guide', { dropDown: shouldAnimate }]">
    <h2>{{ $t('iconGuide.title') }}</h2>

    <p class="guide-access">{{ $t('iconGuide.access') }}</p>
    <p class="guide-subtitle">{{ $t('iconGuide.subtitle') }}</p>

    <div class="guide-icon-wrapper">
      <img src="/icons/icon-192x192.png" alt="OS Yamato Icon" class="guide-icon" />
    </div>

    <hr class="subtitle-divider" />
    <p class="guide-instruction">{{ $t('iconGuide.instruction') }}</p>

    <!-- 成長ステータス -->
    <div class="icon-flex-grid">
      <div v-for="item in statusIcons" :key="item.emoji" class="icon-container">
        <div
          class="icon-box icon-circle tooltip-wrapper"
          :class="{ active: activeEmoji === item.emoji }"
          @click="toggleTooltip(item.emoji, $event)"
          @mouseleave="hideTooltip"
        >
          <span class="icon">{{ item.emoji }}</span>
          <span v-if="activeEmoji === item.emoji" class="tooltip-text" :style="tooltipStyle">
            {{ item.description }}
          </span>
        </div>
      </div>
    </div>

    <!-- その他アイコン -->
    <div class="icon-flex-grid">
      <div v-for="item in otherIcons" :key="item.emoji" class="icon-container">
        <div
          class="icon-box icon-circle tooltip-wrapper"
          :class="{ active: activeEmoji === item.emoji }"
          @click="toggleTooltip(item.emoji, $event)"
          @mouseleave="hideTooltip"
        >
          <span class="icon">{{ item.emoji }}</span>
          <span v-if="activeEmoji === item.emoji" class="tooltip-text" :style="tooltipStyle">
            {{ item.description }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const shouldAnimate = ref(false)
const activeEmoji = ref(null)
const tooltipStyle = ref({})

const { t } = useI18n()

const statusIcons = [
  { emoji: '🌱', description: t('iconGuide.statusSprout') },
  { emoji: '🌷', description: t('iconGuide.statusBloom') },
  { emoji: '🥀', description: t('iconGuide.statusWither') }
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
  { emoji: '📎', description: t('iconGuide.upload') }
]

function toggleTooltip(emoji, event) {
  if (activeEmoji.value === emoji) {
    activeEmoji.value = null
    return
  }
  activeEmoji.value = emoji

  // 位置調整
  const rect = event.currentTarget.getBoundingClientRect()
  const screenWidth = window.innerWidth

  // 左右マージン 8px 確保
  let left = '50%'
  if (rect.left < 40) {
    left = 'calc(50% + 20px)' // 左に寄りすぎ防止
  } else if (rect.right > screenWidth - 40) {
    left = 'calc(50% - 20px)' // 右に寄りすぎ防止
  }

  tooltipStyle.value = { left }
}

function hideTooltip() {
  activeEmoji.value = null
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
  margin-bottom: 1.2rem;
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
  justify-content: center;
}

.icon-box {
  width: 48px;
  height: 48px;
  font-size: 1.6rem;
  position: relative;
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

.tooltip-text {
  visibility: visible;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 8px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.95;
  font-size: 0.75rem;
  white-space: pre-wrap;
  width: max-content;
  max-width: 160px;
}

.guide-subtitle,
.guide-access,
.guide-instruction {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  white-space: pre-wrap;
}

@media (prefers-color-scheme: dark) {
  .guide-subtitle,
  .guide-access,
  .guide-instruction {
    color: #ccc;
  }
}

.subtitle-divider {
  border: none;
  border-top: 1px solid #aaa;
  margin: 1rem auto;
  width: 60%;
}

.guide-icon-wrapper {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.guide-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
}

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
