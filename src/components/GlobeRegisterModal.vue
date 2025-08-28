<template>
  <transition name="fade-modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-card">
<h2 class="modal-title">{{ t('blossom.title') }}</h2>

        <div class="form-area">
<input
  v-model="nickname"
  :placeholder="t('blossom.nicknamePlaceholder')"
  class="modal-input"
/>

<input
  v-model="comment"
  :placeholder="t('blossom.commentPlaceholder')"
  class="modal-input"
/>
<input
  v-model="yamatoId"
  :placeholder="t('blossom.yamatoIdPlaceholder')"
  class="modal-input"
/>

<div class="select-labels">
  <span>{{ t('blossom.selectCountry') }}</span>
  <span>{{ t('blossom.selectHobby') }}</span>
</div>

          <div class="row-fields">
            <select v-model="selectedCountry" class="modal-select">
              <option value="">🌐</option>
              <option v-for="(code, emoji) in countryMap" :key="code" :value="code">{{ emoji }}</option>
            </select>

            <select v-model="selectedHobby" class="modal-select">
              <option value="">🤫</option>
              <option v-for="(code, emoji) in hobbyMap" :key="code" :value="code">{{ emoji }}</option>
            </select>
          </div>

          <div class="button-row">
<YamatoButton :disabled="!nickname" @click="submitForm">
  {{ t('button.register') }}
</YamatoButton>
<YamatoButton v-if="hasExisting" type="danger" @click="handleDelete">
  {{ t('delete') }}
</YamatoButton>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import YamatoButton from '@/components/YamatoButton.vue'
import { API, graphqlOperation } from 'aws-amplify'
import { deleteBlossom } from '@/graphql/mutations'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  initialData: Object
})

const emit = defineEmits(['close', 'submit'])

// 登録済みのBlossomがあるかどうかを判定
const hasExisting = computed(() => !!props.initialData?.id)

// 削除処理
const handleDelete = async () => {
  if (!props.initialData?.id) return
  const confirmed = confirm('本当に削除しますか？')
  if (!confirmed) return

  try {
    await API.graphql(graphqlOperation(deleteBlossom, {
      input: { id: props.initialData.id }
    }))
    emit('close')
  } catch (e) {
    console.error('❌ 削除失敗', e)
  }
}

// 入力値
const comment = ref('')
const yamatoId = ref('')
const selectedCountry = ref('')
const selectedHobby = ref('')
const nickname = ref('')

// 初期値反映
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      nickname.value = data.nickname || ''   // ← 追加
      comment.value = data.comment || ''
      yamatoId.value = data.yamatoId || ''
      selectedCountry.value = data.country || ''
      selectedHobby.value = data.hobby || ''
    } else {
      nickname.value = ''                     // ← 追加
      comment.value = ''
      yamatoId.value = ''
      selectedCountry.value = ''
      selectedHobby.value = ''
    }
  },
  { immediate: true }
)

// モーダルを閉じる
const handleClose = () => {
  emit('close')
}

// 登録処理
const submitForm = () => {
  emit('submit', {
    nickname: nickname.value, // ← 追加！
    comment: comment.value,
    yamatoId: yamatoId.value,
    country: selectedCountry.value,
    hobby: selectedHobby.value
  })
  handleClose()
}

// 国・趣味の辞書
const countryMap = {
  '🇯🇵': 'jp', '🇺🇸': 'us', '🇫🇷': 'fr', '🇩🇪': 'de', '🇮🇳': 'in',
  '🇰🇷': 'kr', '🇨🇳': 'cn', '🇬🇧': 'uk', '🇧🇷': 'br', '🇨🇦': 'ca',
  '🇮🇹': 'it', '🇪🇸': 'es', '🇦🇺': 'au', '🇸🇬': 'sg', '🇹🇭': 'th',
  '🇵🇭': 'ph', '🇻🇳': 'vn',

  // ✅ 追加
  '🇲🇾': 'my', // マレーシア
  '🇮🇩': 'id', // インドネシア
  '🇲🇽': 'mx', // メキシコ
  '🇷🇺': 'ru', // ロシア
  '🇺🇦': 'ua', // ウクライナ
  '🇸🇦': 'sa', // サウジアラビア
  '🇪🇬': 'eg', // エジプト
  '🇳🇬': 'ng', // ナイジェリア
  '🇹🇷': 'tr', // トルコ
  '🇿🇦': 'za', // 南アフリカ
  '🇦🇷': 'ar', // アルゼンチン
  '🇨🇴': 'co', // コロンビア
  '🇵🇰': 'pk', // パキスタン
  '🇳🇵': 'np', // ネパール
  '🇸🇪': 'se', // スウェーデン
  '🇳🇱': 'nl', // オランダ
  '🇳🇴': 'no', // ノルウェー
  '🇫🇮': 'fi', // フィンランド
  '🇨🇭': 'ch', // スイス
  '🇳🇿': 'nz'  // ニュージーランド
}

const hobbyMap = {
  '🎨': 'art', '🎸': 'music', '📚': 'reading', '🏃': 'running',
  '✈️': 'travel', '🎮': 'gaming', '☕': 'coffee', '🌸': 'hanami',
  '🌊': 'surfing', '📷': 'photography', '🧘': 'meditation', '🐶': 'dogs',
  '🐱': 'cats', '🍳': 'cooking', '🧵': 'crafting', '🎬': 'movies',
  '🌱': 'gardening'
}
</script>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 1000;
}

.modal-card {
  background: #1a1a1a;
  color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
  max-width: 480px;
  width: 90%;
  animation: fadeIn 0.5s ease-out;
}

.modal-title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #f5f5f5;
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
}

.modal-input,
.modal-select {
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #f5f5f5;
  width: 100%;
  max-width: 400px;
}

.modal-select {
  flex: 1;
  padding: 0.6rem;
  font-size: 1.2rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  appearance: none;
  text-align: center;
}

.modal-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #88f inset;
}

.fade-modal-enter-active {
  animation: fadeIn 0.6s ease-out;
}

.fade-modal-leave-active {
  animation: fadeOut 0.4s ease-in;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px);
  }
}

.row-fields {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 0.3rem;
}

.modal-select {
  width: 44px; /* ← 小さめに */
  height: 44px;
  font-size: 1.0rem; /* ← 小ぶりの絵文字サイズ */
  border-radius: 10px;
  border: none;
  background-color: #2e2e2e; /* ← 明るいグレー背景 */
  color: #111;
  text-align: center;
  appearance: none;
  box-shadow: 0 0 0 1px #aaa inset;
  transition: box-shadow 0.2s;
}

.modal-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #88f inset;
}
.select-labels {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.85rem;
  color: #ccc;
  margin-bottom: 0.2rem;
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

</style>
