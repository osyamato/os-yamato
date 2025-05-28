<template>
  <transition name="fade-drop">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="search-modal">
        <h2 class="modal-title">花を咲かせた人を探しにいく</h2>

        <!-- ニックネーム -->
        <input
          v-model="nickname"
          placeholder="ニックネーム（例：はなこ）"
          class="modal-input"
        />

        <!-- ラベル -->
        <div class="select-labels">
          <span>国を選択</span>
          <span>趣味を選択</span>
        </div>

        <!-- セレクト（横並び） -->
        <div class="row-fields">
          <select v-model="country" class="modal-select">
            <option value="">🌐</option>
            <option
              v-for="(code, emoji) in countryMap"
              :key="code"
              :value="code"
            >
              {{ emoji }}
            </option>
          </select>

          <select v-model="hobby" class="modal-select">
            <option value="">🤫</option>
            <option
              v-for="(code, emoji) in hobbyMap"
              :key="code"
              :value="code"
            >
              {{ emoji }}
            </option>
          </select>
        </div>

        <!-- ボタン -->
        <div class="button-row">
          <YamatoButton @click="search">ヤマトで検索</YamatoButton>
        </div>

        <!-- 結果リスト -->
        <div class="result-list">
          <div
            v-for="item in filteredResults"
            :key="item.id"
            class="result-card"
            @click="select(item)"
          >
            <p>{{ item.nickname || '' }}</p>
            <p>{{ emojiCountry(item.country) }} / {{ emojiHobby(item.hobby) }}</p>
          </div>

          <p v-if="filteredResults.length === 0 && hasSearched" class="no-result">
            見つかりませんでした
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import YamatoButton from '@/components/YamatoButton.vue'
import { countryMap, hobbyMap } from '@/utils/emojiMaps'

const emit = defineEmits(['close', 'select'])
const props = defineProps({
  visible: Boolean,
  results: Array
})

const nickname = ref('')
const country = ref('')
const hobby = ref('')
const filteredResults = ref([])
const hasSearched = ref(false)

const initialized = ref(false)

watch(() => props.visible, (newVal) => {
  if (newVal && !initialized.value) {
    nickname.value = ''
    country.value = ''
    hobby.value = ''
    filteredResults.value = []
    hasSearched.value = false
    initialized.value = true
  }
  if (!newVal) {
    // モーダルを完全に閉じたら、次の表示時は初期化する
    initialized.value = false
  }
})

function close() {
  nickname.value = ''
  country.value = ''
  hobby.value = ''
  filteredResults.value = []
  hasSearched.value = false
  emit('close')
}

function search() {
  hasSearched.value = true
  const keyword = nickname.value.trim().toLowerCase()
  const selectedCountry = country.value.trim().toLowerCase()
  const selectedHobby = hobby.value.trim().toLowerCase()

  filteredResults.value = (props.results || []).filter(b => {
    const nicknameField = (b.nickname ?? '').toLowerCase()
    const countryField = (b.country ?? '').toLowerCase()
    const hobbyField = (b.hobby ?? '').toLowerCase()

    return (
      (!keyword || nicknameField.includes(keyword)) &&
      (!selectedCountry || countryField === selectedCountry) &&
      (!selectedHobby || hobbyField === selectedHobby)
    )
  })
}

function select(item) {
  emit('select', item)
  close()
}

function emojiCountry(code) {
  return countryMap && Object.values(countryMap).includes(code)
    ? Object.keys(countryMap).find(key => countryMap[key] === code)
    : '🌍'
}

function emojiHobby(code) {
  return hobbyMap && Object.values(hobbyMap).includes(code)
    ? Object.keys(hobbyMap).find(key => hobbyMap[key] === code)
    : '🎯'
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
  padding-top: 10vh;
  z-index: 1000;
}

.search-modal {
  background: #1a1a1a;
  color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 1rem;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
  animation: dropDown 0.5s ease-out;
}

.fade-drop-enter-active {
  animation: dropDown 0.5s ease-out;
}
.fade-drop-leave-active {
  animation: flyUp 0.4s ease-in forwards;
}

@keyframes dropDown {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes flyUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
}

.modal-title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #f5f5f5;
}

.modal-input {
  width: 100%;
  padding: 0.6rem 1rem;
  margin-top: 0.25rem;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: #2a2a2a;
  color: #f5f5f5;
  font-size: 1rem;
  appearance: none;
  text-align: center;
}

.select-labels {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.85rem;
  color: #ccc;
  margin-top: 1rem;
  margin-bottom: 0.2rem;
}

.row-fields {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 0.2rem;
  margin-bottom: 1rem;
}

.modal-select {
  width: 40px;                    /* ← 横幅さらに小さく */
  height: 40px;                   /* ← 高さも少しだけ圧縮 */
  font-size: 1.0rem;
  border-radius: 10px;
  border: none;
  background-color: #2e2e2e;
  color: #fff;
  appearance: none;
  box-shadow: 0 0 0 1px #aaa inset;
  padding: 0;
  line-height: 40px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  text-align-last: center;
  text-indent: 0.01px;
}


.modal-select:focus {
  outline: none;
  box-shadow: 0 0 0 1px #88f inset;
}

.button-row {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.result-list {
  margin-top: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.result-card {
  background: #2a2a2a;
  color: #f5f5f5;
  padding: 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #444;
}

.result-card:hover {
  background: #333;
}

.no-result {
  text-align: center;
  color: #888;
  font-size: 0.95rem;
  margin-top: 1rem;
}
</style>
