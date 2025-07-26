<template>
  <Modal :visible="visible" @close="handleClose">
    <div class="modal-content">
      <!-- ☀️ 選択された天気の表示（ローカライズ） -->
      <p class="weather-info">
        {{ weatherIcon(selectedWeather) }} {{ t(`weatherMain.${selectedWeather}`) }}（{{ temperature }}℃）
      </p>

      <!-- 🌤️ 天気ピッカー -->
      <select v-model="selectedWeather" class="weather-select">
        <option disabled value="">{{ t('selectWeather') }}</option>
        <option
          v-for="weather in weatherOptions"
          :key="weather"
          :value="weather"
        >
          {{ t(`weatherMain.${weather}`) }}
        </option>
      </select>

      <!-- 📝 コメント入力欄 -->
      <textarea
        v-model="content"
        :placeholder="t('weatherPlaceholder')"
        maxlength="120"
        class="comment-input"
      ></textarea>

      <!-- 📸 写真アップロード -->
      <input type="file" accept="image/*" @change="handleImage" />

      <!-- ✅ 投稿ボタン -->
      <button class="submit-button" @click="submitComment" :disabled="loading || !selectedWeather">
        {{ loading ? t('submitting') : t('submit') }}
      </button>
    </div>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API, graphqlOperation, Storage, Auth } from 'aws-amplify'
import { createWeatherComment } from '@/graphql/mutations'
import Modal from '@/components/Modal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  weather: String, // 例: "Clear"
  temperature: Number,
  timeOfDay: Number,
  language: String
})
const emit = defineEmits(['close', 'submitted'])

const content = ref('')
const imageFile = ref(null)
const loading = ref(false)
const selectedWeather = ref('')

// ✅ props.weather を監視して selectedWeather を初期化
watch(
  () => props.weather,
  (newWeather) => {
    if (newWeather) {
      selectedWeather.value = newWeather
    }
  },
  { immediate: true }
)

const weatherOptions = [
  "Clear", "Clouds", "Rain", "Snow", "Thunderstorm", "Mist"
]

function weatherIcon(main) {
  if (!main) return '❔'
  if (main === 'Clear') return '☀️'
  if (main === 'Clouds') return '⛅'
  if (main === 'Rain') return '🌧️'
  if (main === 'Snow') return '❄️'
  if (main === 'Thunderstorm') return '⚡'
  if (main === 'Mist') return '🌫️'
  return '🌤️'
}

function handleClose() {
  emit('close')
}

function handleImage(event) {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
  }
}

async function submitComment() {
  if (!content.value.trim() || !selectedWeather.value) return
  loading.value = true

  try {
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.username
    let imageKey = null

    if (imageFile.value) {
      const filename = `weather/${Date.now()}_${imageFile.value.name}`
      await Storage.put(filename, imageFile.value, {
        contentType: imageFile.value.type
      })
      imageKey = filename
    }

    await API.graphql(graphqlOperation(createWeatherComment, {
      input: {
        owner,
        weather: selectedWeather.value,
        temperature: props.temperature,
        timeOfDay: props.timeOfDay,
        language: props.language,
        content: content.value,
        imageKey,
        likeCount: 0,
        reportCount: 0,
        replyCount: 0
      }
    }))

    emit('submitted')
    emit('close')
    content.value = ''
    imageFile.value = null
    selectedWeather.value = ''
  } catch (error) {
    console.error('❌ 投稿エラー:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.weather-info {
  font-size: 1.2rem;
}
.weather-select {
  padding: 0.5em;
  font-size: 1rem;
}
.comment-input {
  width: 100%;
  height: 100px;
  padding: 0.5em;
  font-size: 1rem;
}
.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.6em 1.2em;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
}
</style>
