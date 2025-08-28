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

        <!-- ✅ 国と趣味を横並びにまとめる -->
        <div
          v-if="profile.country || profile.hobby"
          class="profile-row-combined"
        >
          <div v-if="profile.country" class="profile-section half">
            <label>{{ t('blossom.country') }}</label>
            <p class="profile-text">{{ emojiCountry(profile.country) }}</p>
          </div>
          <div v-if="profile.hobby" class="profile-section half">
            <label>{{ t('blossom.hobby') }}</label>
            <p class="profile-text">{{ emojiHobby(profile.hobby) }}</p>
          </div>
        </div>

        <div v-if="profile.yamatoId" class="profile-section">
          <label>Yamato ID</label>
          <p class="profile-text">{{ profile.yamatoId }}</p>
        </div>

        <div class="button-row" v-if="canRequest">
          <YamatoButton
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
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  profile: Object,
  hasOwnProfile: Boolean
})

const emit = defineEmits(['back', 'request'])

const canRequest = computed(() => {
  return (
    props.profile &&
    !!props.profile.yamatoId &&
    props.hasOwnProfile
  )
})

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
    vn: '🇻🇳',

    // ✅ 追加分
    my: '🇲🇾', // マレーシア
    id: '🇮🇩', // インドネシア
    mx: '🇲🇽', // メキシコ
    ru: '🇷🇺', // ロシア
    ua: '🇺🇦', // ウクライナ
    sa: '🇸🇦', // サウジアラビア
    eg: '🇪🇬', // エジプト
    ng: '🇳🇬', // ナイジェリア
    tr: '🇹🇷', // トルコ
    za: '🇿🇦', // 南アフリカ
    ar: '🇦🇷', // アルゼンチン
    co: '🇨🇴', // コロンビア
    pk: '🇵🇰', // パキスタン
    np: '🇳🇵', // ネパール
    se: '🇸🇪', // スウェーデン
    nl: '🇳🇱', // オランダ
    no: '🇳🇴', // ノルウェー
    fi: '🇫🇮', // フィンランド
    ch: '🇨🇭', // スイス
    nz: '🇳🇿'  // ニュージーランド

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
  max-height: 80vh;
  overflow-y: auto;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.profile-section label {
  flex-shrink: 0;
  font-weight: bold;
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 0;
}

.profile-text {
  flex: 1;
  background: #2a2a2a;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #f5f5f5;
  margin-left: 0.5rem;
}

.profile-row-combined {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}

.profile-section.half {
  flex: 1;
}

.button-row button {
  min-width: 180px !important;
  white-space: nowrap !important;
  padding: 0.5rem 1rem !important;
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


