<template>
  <Modal :visible="visible" @close="handleClose">
    <div class="scrollable-modal-content">

     <h2 class="weather-title">{{ t('weather.post.title') }}</h2>

      <!-- 🌤️ 天気 & 🌡️ 気温 & 🕒 時間 ピッカー -->
      <div class="row-pickers">
        <select v-model="selectedWeather" class="yamato-select">
          <option disabled value="">{{ t('selectWeather') }}</option>
          <option
            v-for="weather in weatherOptions"
            :key="weather"
            :value="weather"
          >
            {{ t(`weatherMain.${weather}`) }}
          </option>
        </select>

        <select v-model="selectedTemperature" class="yamato-select">
          <option disabled value="">{{ t('selectTemperature') }}</option>
          <option
            v-for="temp in temperatureOptions"
            :key="temp"
            :value="temp"
          >
            {{ temp }}℃
          </option>
        </select>

        <select v-model="selectedHour" class="yamato-select">
          <option disabled value="">{{ t('selectHour') }}</option>
          <option v-for="hour in 24" :key="hour" :value="hour">
            {{ hour }}:00
          </option>
        </select>
      </div>

      <!-- 📝 コメント -->
      <textarea
        v-model="content"
        :placeholder="t('weatherPlaceholder')"
        maxlength="200"
        class="yamato-textarea"
      ></textarea>

      <!-- 📸 プレビュー -->
      <div v-if="previewUrl" class="image-preview">
        <img :src="previewUrl" alt="preview" />
        <button class="remove-image" @click="removeImage">✖️</button>
      </div>

      <!-- 📷 写真ボタン -->
      <button
        v-if="!previewUrl"
        class="image-button"
        @click="triggerFileInput"
      >
        📷
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleImage"
        class="hidden-file"
      />

      <!-- ✅ 投稿ボタン -->
      <div class="submit-wrapper">
        <YamatoButton
          color="green"
          :disabled="loading || !selectedWeather || content.trim().length < 10"
          @click="submitComment"
        >
          {{ t('submit') }}
        </YamatoButton>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { API, graphqlOperation, Storage, Auth } from 'aws-amplify'
import { createWeatherComment } from '@/graphql/mutations'
import { listWeatherProfiles } from '@/graphql/queries'
import Modal from '@/components/Modal.vue'
import YamatoButton from '@/components/YamatoButton.vue'
import { useI18n } from 'vue-i18n'
import { getCachedProfile } from '@/utils/weatherProfileCache'


const { t } = useI18n()
const props = defineProps({
  visible: Boolean,
  weather: String,
  temperature: Number,
  timeOfDay: Number,
  language: String
})
const emit = defineEmits(['close', 'submitted'])

const content = ref('')
const imageFile = ref(null)
const previewUrl = ref(null)
const loading = ref(false)
const fileInput = ref(null)

const selectedWeather = ref('')
const selectedTemperature = ref(0)
const selectedHour = ref(new Date().getHours())

const weatherOptions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm', 'Mist']
const temperatureOptions = Array.from({ length: 51 }, (_, i) => i - 10)

const originalFile = ref(null)
const thumbnailBlob = ref(null)

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.weather) selectedWeather.value = props.weather
    if (typeof props.temperature === 'number') selectedTemperature.value = props.temperature
    if (typeof props.timeOfDay === 'number') selectedHour.value = props.timeOfDay
  }
})

watch(() => props.weather, (w) => {
  if (w) selectedWeather.value = w
}, { immediate: true })

watch(() => props.temperature, (t) => {
  if (typeof t === 'number') selectedTemperature.value = t
}, { immediate: true })

function handleClose() {
  emit('close')
}

function triggerFileInput() {
  fileInput.value?.click()
}

function resizeImage(file, maxWidth) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // アスペクト比を維持してリサイズ
        const scale = maxWidth / img.width
        const canvas = document.createElement('canvas')
        canvas.width = maxWidth
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // JPEG 85% 品質で出力
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function handleImage(event) {
  const file = event.target.files[0]
  if (!file) return

  imageFile.value = file
  originalFile.value = file
  previewUrl.value = URL.createObjectURL(file)

  // サムネイル生成（300px幅）
  resizeImage(file, 300).then(blob => {
    thumbnailBlob.value = blob
  })
}

function removeImage() {
  imageFile.value = null
  previewUrl.value = null
}

async function submitComment() {
  if (!content.value.trim() || !selectedWeather.value) return
  loading.value = true

  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub

    // ✅ プロフィールキャッシュから取得
    const profile = await getCachedProfile()

    const owner = sub
    const ownerNickname = profile?.nickname || ''
    const icon = profile?.icon || ''

    let imageKey = null
    let thumbnailKey = null

    if (imageFile.value) {
      const ext = imageFile.value.name.split('.').pop()
      const baseName = `weather/${Date.now()}`
      const imageFileName = `${baseName}.${ext}`
      const thumbFileName = `${baseName}_thumb.${ext}`

      // 🔹 オリジナル画像を横幅1280pxにリサイズ
      const resizedOriginal = await resizeImage(imageFile.value, 1280)
      await Storage.put(imageFileName, resizedOriginal, {
        contentType: 'image/jpeg'
      })

      // 🔹 サムネイルを横幅300pxで生成
      const resizedThumb = await resizeImage(imageFile.value, 300)
      await Storage.put(thumbFileName, resizedThumb, {
        contentType: 'image/jpeg'
      })

      imageKey = imageFileName
      thumbnailKey = thumbFileName
    }

    // ✅ GraphQLでコメント作成
    await API.graphql(graphqlOperation(createWeatherComment, {
      input: {
        owner,
        ownerNickname,
        icon,
        weather: selectedWeather.value,
        temperature: selectedTemperature.value,
        timeOfDay: selectedHour.value,
        language: props.language,
        content: content.value,
        imageKey,
        thumbnailKey,
        profileView: true,
        likeCount: 0,
        reportCount: 0,
        replyCount: 0
      }
    }))

    emit('submitted')
    emit('close')
    content.value = ''
    removeImage()
    selectedWeather.value = ''
    selectedTemperature.value = 0
    selectedHour.value = new Date().getHours()
  } catch (err) {
    console.error('❌ 投稿エラー:', JSON.stringify(err, null, 2))
  } finally {
    loading.value = false
  }
}

</script>


<style scoped>
.weather-title {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #444;
}
@media (prefers-color-scheme: dark) {
  .weather-title {
    color: #eee;
  }
}
.yamato-select {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6em 1em;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  appearance: none;
  outline: none;
}
.yamato-select:focus {
  border-color: #4CAF50;
}
.yamato-textarea {
  width: 100%;
  height: 100px;
  padding: 0.75em;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  resize: vertical;
  margin-bottom: 1rem;
}
.image-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  margin: 0 auto;
  display: block;
  cursor: pointer;
}
.hidden-file {
  display: none;
}
.image-preview {
  position: relative;
  margin: 1rem auto;
  max-width: 100%;
  max-height: 160px;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f4f4;
}

@media (prefers-color-scheme: dark) {
  .image-preview {
    background: #1c1c1c;
  }
}

.image-preview img {
  max-height: 160px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  border-radius: 8px;
}
.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5); /* ← ❌ これが丸背景 */
  border: none;
  color: white;
  font-size: 1.4rem;
  width: auto;
  height: auto;
  padding: 0;
  line-height: 1;
  cursor: pointer;
  background: none;     /* ✅ 修正：背景を消す */
  border-radius: 0;     /* ✅ 修正：丸くしない */
}
.submit-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}
@media (prefers-color-scheme: dark) {
  .yamato-select,
  .yamato-textarea {
    background-color: #2e2e2e;
    color: #fff;
    border: 1px solid #555;
  }
  .yamato-select option {
    background-color: #2e2e2e;
  }
}
.row-pickers {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.row-pickers .yamato-select {
  flex: 1;
}
.scrollable-modal-content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 6px;
  max-height: 70vh;
}
</style>
