<template>
  <div class="game-view">
    <!-- 🕰️ タイマー＆操作アイコン -->
    <div class="game-header">
      <div class="icon-group">
        <div
          class="icon-button"
          :style="{ backgroundColor: iconColor }"
          @click="handleClockClick"
        >
          🕰️
        </div>
        <div
          class="icon-button"
          :style="{ backgroundColor: iconColor }"
          @click="restartGame"
        >
          ↻
        </div>
      </div>
      <div class="timer-text">{{ formattedTime }}</div>
    </div>

    <!-- 🌸 花あわせカードグリッド -->
    <div class="card-grid">
      <div
        v-for="(card, index) in shuffledCards"
        :key="index"
        class="card"
        :class="{
          flipped: card.flipped || card.matched,
          transitioning: card.transitioning
        }"
        @click="flipCard(index)"
      >
        <div class="card-inner">
          <div class="card-front"></div>
          <div class="card-back">
            <img :src="card.img" alt="花カード" />
          </div>
        </div>
      </div>
    </div>

    <!-- 🪧 モーダル：ベストタイム -->
<ModalContent :visible="showBestModal" @close="showBestModal = false">
  <template #default>
    <h3>{{ $t('game.bestTimeTitle') }}</h3>
    <ol v-if="bestTimes.length">
      <li v-for="record in bestTimes" :key="record.id">
        ⏱️ {{ formatTime(record.bestTimeSec) }}
      </li>
    </ol>
    <p v-else>{{ $t('game.noRecords') }}</p>
  </template>
</ModalContent>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import ModalContent from '@/components/Modal.vue'
import { createBestRecord, deleteBestRecord } from '@/graphql/mutations'
import { listBestRecords } from '@/graphql/queries'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const showBestModal = ref(false)
const bestTimes = ref([])
const showConfetti = ref(false)

async function handleClockClick() {
  showBestModal.value = true
  await fetchBestScores()
}

async function fetchBestScores() {
  const res = await API.graphql(graphqlOperation(listBestRecords))
  const items = res.data?.listBestRecords?.items || []
  bestTimes.value = items
    .filter(i => i?.gameType === 'flower-match')
    .sort((a, b) => a.bestTimeSec - b.bestTimeSec)
    .slice(0, 3)
}

const basePaths = Array.from({ length: 12 }, (_, i) => `/dialy.${i + 1}.png`)
const cardPool = basePaths.flatMap(img => [
  { img, flipped: false, matched: false, transitioning: false },
  { img, flipped: false, matched: false, transitioning: false }
])
const shuffledCards = ref(shuffle([...cardPool]))

function launchConfetti() {
  showConfetti.value = false
  void nextTick(() => {
    showConfetti.value = true
  })
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5)
}

const flippedIndices = ref([])
const gameStarted = ref(false)
const time = ref(0)
const timer = ref(null)

function flipCard(index) {
  const card = shuffledCards.value[index]
  if (card.flipped || card.matched || flippedIndices.value.length === 2) return

  if (!gameStarted.value) {
    gameStarted.value = true
    timer.value = setInterval(() => time.value++, 1000)
  }

  card.flipped = true
  flippedIndices.value.push(index)

  if (flippedIndices.value.length === 2) {
    const [i1, i2] = flippedIndices.value
    const c1 = shuffledCards.value[i1]
    const c2 = shuffledCards.value[i2]

    if (c1.img === c2.img) {
      c1.matched = true
      c2.matched = true
      flippedIndices.value = []
    } else {
      setTimeout(() => {
        c1.flipped = false
        c2.flipped = false
        flippedIndices.value = []
      }, 1000)
    }
  }
}

function restartGame() {
  if (timer.value) clearInterval(timer.value)
  time.value = 0
  gameStarted.value = false
  flippedIndices.value = []

  for (const card of shuffledCards.value) {
    card.flipped = false
    card.matched = false
    card.transitioning = true
  }

  setTimeout(() => {
    shuffledCards.value = shuffle([...cardPool]).map(c => ({
      ...c,
      flipped: false,
      matched: false,
      transitioning: true
    }))
    setTimeout(() => {
      for (const card of shuffledCards.value) card.transitioning = false
    }, 300)
  }, 100)
}

const gameCompleted = computed(() => shuffledCards.value.every(c => c.matched))
const bestTimeSec = ref(null)

watch(gameCompleted, async done => {
  if (done && timer.value) {
    clearInterval(timer.value)
    timer.value = null
    launchConfetti()
    setTimeout(() => showConfetti.value = false, 3000)

    if (bestTimeSec.value === null || time.value < bestTimeSec.value) {
      bestTimeSec.value = time.value

      await API.graphql(graphqlOperation(createBestRecord, {
        input: {
          gameType: 'flower-match',
          bestTimeSec: time.value
        }
      }))

      await cleanUpOldRecords()
    }
  }
})


async function cleanUpOldRecords() {
  const res = await API.graphql(graphqlOperation(listBestRecords))
  const items = res.data?.listBestRecords?.items || []
  const sorted = items
    .filter(i => i?.gameType === 'flower-match')
    .sort((a, b) => a.bestTimeSec - b.bestTimeSec)
  const toDelete = sorted.slice(3)
  for (const item of toDelete) {
    await API.graphql(graphqlOperation(deleteBestRecord, { input: { id: item.id } }))
  }
}

const formattedTime = computed(() => {
  const min = Math.floor(time.value / 60)
  const sec = time.value % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})

function formatTime(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value)
})

const iconColor = ref('#666')
Auth.currentAuthenticatedUser()
  .then(user => {
    iconColor.value = user.attributes['custom:iconColor'] || '#666'
  })
  .catch(() => {})
</script>

<style>
.game-view {
  padding: 2rem;
  text-align: center;
}


.game-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.icon-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #b6f1cc;
  color: black;
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
}

.timer-text {
  font-size: 1rem;
  color: #444;
  font-weight: 600;
}

.card-grid {
  display: grid;
  gap: 0.5rem;
  justify-content: center;
  grid-template-columns: repeat(6, 70px);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(4, 70px);
  }
}

.card {
  width: 100%;
  aspect-ratio: 1 / 1;
  perspective: 800px;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
  position: relative;
}

.card.flipped .card-inner,
.card.matched .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
}

.card-front {
  background: #f9f5ef;
}

.card-back {
  transform: rotateY(180deg);
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-back img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.completion-message {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
}



</style>

