<template>
  <transition name="fade-modal">
    <div v-if="visible" class="modal-overlay" @click.self="emit('back')">
      <div class="profile-modal">
        <h2 class="modal-title">🌸 花のプロフィール</h2>

        <div v-if="profile.nickname" class="profile-section">
          <label>🧑 ニックネーム</label>
          <p class="profile-text">{{ profile.nickname }}</p>
        </div>

        <div v-if="profile.comment" class="profile-section">
          <label>🗒️ コメント</label>
          <p class="profile-text">{{ profile.comment }}</p>
        </div>

        <div v-if="profile.country" class="profile-section">
          <label>🌍 国</label>
          <p class="profile-text">{{ emojiCountry(profile.country) }}</p>
        </div>

        <div v-if="profile.hobby" class="profile-section">
          <label>🎯 趣味</label>
          <p class="profile-text">{{ emojiHobby(profile.hobby) }}</p>
        </div>

        <div v-if="profile.yamatoId" class="profile-section">
          <label>🆔 Yamato ID</label>
          <p class="profile-text">{{ profile.yamatoId }}</p>
        </div>
<div class="button-row">
  <YamatoButton
    v-if="profile.yamatoId"
    type="primary"
    @click="emit('request', profile.yamatoId)"
  >
    📮 チャット申請へ
  </YamatoButton>
</div>


        <div class="button-row">
          <YamatoButton @click="emit('back')">← 戻る</YamatoButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import YamatoButton from '@/components/YamatoButton.vue'

const props = defineProps({
  visible: Boolean,
  profile: Object
})

const emit = defineEmits(['back', 'request'])

function emojiCountry(code) {
  return {
    jp: '🇯🇵 日本',
    us: '🇺🇸 アメリカ',
    fr: '🇫🇷 フランス',
    de: '🇩🇪 ドイツ',
    in: '🇮🇳 インド',
    kr: '🇰🇷 韓国',
    cn: '🇨🇳 中国',
    uk: '🇬🇧 イギリス',
    br: '🇧🇷 ブラジル',
    ca: '🇨🇦 カナダ',
    it: '🇮🇹 イタリア',
    es: '🇪🇸 スペイン',
    au: '🇦🇺 オーストラリア',
    sg: '🇸🇬 シンガポール',
    th: '🇹🇭 タイ',
    ph: '🇵🇭 フィリピン',
    vn: '🇻🇳 ベトナム'
  }[code] || '🌍 未選択'
}

function emojiHobby(code) {
  return {
    art: '🎨 アート',
    music: '🎸 音楽',
    reading: '📚 読書',
    running: '🏃 ランニング',
    travel: '✈️ 旅行',
    gaming: '🎮 ゲーム',
    coffee: '☕ コーヒー',
    hanami: '🌸 花見',
    surfing: '🌊 サーフィン',
    photography: '📷 写真',
    meditation: '🧘 瞑想',
    dogs: '🐶 犬',
    cats: '🐱 猫',
    cooking: '🍳 料理',
    crafting: '🧵 手芸',
    movies: '🎬 映画',
    gardening: '🌱 ガーデニング'
  }[code] || '🎯 未選択'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 8vh;
  z-index: 1000;
}

.profile-modal {
  background: #1a1a1a;
  color: #f5f5f5;
  padding: 1.8rem;
  border-radius: 1rem;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
  animation: scaleFadeIn 0.3s ease;
}

.modal-title {
  text-align: center;
  margin-bottom: 1.2rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
}

.profile-section {
  margin-bottom: 1rem;
}

.profile-section label {
  font-weight: bold;
  display: block;
  font-size: 0.95rem;
  color: #ccc;
  margin-bottom: 0.2rem;
}

.profile-text {
  background: #2a2a2a;
  padding: 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: #f5f5f5;
}

.button-row {
  text-align: center;
  margin-top: 1.5rem;
}

@keyframes scaleFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

