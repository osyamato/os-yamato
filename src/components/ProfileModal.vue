<template>
  <transition name="fade-modal">
    <div v-if="visible" class="modal-overlay" @click.self="emit('back')">
      <div class="profile-modal">
<h2 class="modal-title">{{ t('blossom.profileTitle') }}</h2>

        <div v-if="profile.nickname" class="profile-section">
<label>{{ t('blossom.nickname') }}</label>
          <p class="profile-text">{{ profile.nickname }}</p>
        </div>

        <div v-if="profile.comment" class="profile-section">
<label>{{ t('blossom.comment') }}</label>
          <p class="profile-text">{{ profile.comment }}</p>
        </div>

        <div v-if="profile.country" class="profile-section">
<label>{{ t('blossom.country') }}</label>
          <p class="profile-text">{{ emojiCountry(profile.country) }}</p>
        </div>

        <div v-if="profile.hobby" class="profile-section">
<label>{{ t('blossom.hobby') }}</label>
          <p class="profile-text">{{ emojiHobby(profile.hobby) }}</p>
        </div>

        <div v-if="profile.yamatoId" class="profile-section">
          <label>Yamato ID</label>
          <p class="profile-text">{{ profile.yamatoId }}</p>
        </div>
<div class="button-row">
<YamatoButton
  v-if="profile.yamatoId"
  type="primary"
  @click="emit('request', profile.yamatoId)"
>
  📮 {{ t('blossom.requestButton') }}
</YamatoButton>
</div>


        <div class="button-row">
<YamatoButton @click="emit('back')">{{ t('close') }}</YamatoButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import YamatoButton from '@/components/YamatoButton.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()


const props = defineProps({
  visible: Boolean,
  profile: Object
})

const emit = defineEmits(['back', 'request'])

function emojiCountry(code) {
  return {
    jp: '🇯🇵',
    us: '🇺🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    in: '🇮🇳',
    kr: '🇰🇷',
    cn: '🇨🇳',
    uk: '🇬🇧',
    br: '🇧🇷',
    ca: '🇨🇦',
    it: '🇮🇹',
    es: '🇪🇸',
    au: '🇦🇺',
    sg: '🇸🇬',
    th: '🇹🇭',
    ph: '🇵🇭',
    vn: '🇻🇳'
  }[code] || '🌍'
}

function emojiHobby(code) {
  return {
    art: '🎨',
    music: '🎸',
    reading: '📚',
    running: '🏃',
    travel: '✈️',
    gaming: '🎮',
    coffee: '☕',
    hanami: '🌸',
    surfing: '🌊',
    photography: '📷',
    meditation: '🧘',
    dogs: '🐶',
    cats: '🐱',
    cooking: '🍳',
    crafting: '🧵',
    movies: '🎬',
    gardening: '🌱'
  }[code] || '🎯'
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

