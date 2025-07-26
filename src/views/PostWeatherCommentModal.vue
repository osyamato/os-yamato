<template>
  <Modal :visible="visible" @close="handleClose">
    <div class="modal-content">
      <!-- ☀️ 天気情報の表示 -->
      <p class="weather-info">
        {{ weatherIcon(weather) }} {{ weather }}（{{ temperature }}℃）
      </p>

      <!-- 📝 コメント入力欄 -->
      <textarea
        v-model="content"
        placeholder="空を見て、ひとこと..."
        maxlength="120"
        class="comment-input"
      ></textarea>

      <!-- 📸 写真アップロード -->
      <input type="file" accept="image/*" @change="handleImage" />

      <!-- ✅ 投稿ボタン -->
      <button class="submit-button" @click="submitComment" :disabled="loading">
        {{ loading ? '投稿中...' : '投稿する' }}
      </button>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import { API, graphqlOperation, Storage, Auth } from 'aws-amplify'
import { createWeatherComment } from '@/graphql/mutations'
import Modal from '@/components/Modal.vue'

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
const loading = ref(false)

function handleClose() {
  emit('close')
}

function handleImage(event) {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
  }
}

function weatherIcon(desc) {
  if (desc.includes('晴')) return '☀️'
  if (desc.includes('曇')) return '⛅'
  if (desc.includes('雨')) return '🌧️'
  if (desc.includes('雪')) return '❄️'
  return '🌤️'
}

async function submitComment() {
  if (!content.value.trim()) return
  loading.value = true

  try {
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.username
    let imageKey = null

    // ✅ 画像があればアップロード
    if (imageFile.value) {
      const filename = `weather/${Date.now()}_${imageFile.value.name}`
      await Storage.put(filename, imageFile.value, {
        contentType: imageFile.value.type
      })
      imageKey = filename
    }

    // ✅ DynamoDBに登録
    await API.graphql(graphqlOperation(createWeatherComment, {
      input: {
        owner,
        weather: props.weather,
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
  } catch (error) {
    console.error('❌ 投稿エラー:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-content {
  padding: 16px;
  text-align: center;
}
.weather-info {
  margin-bottom: 12px;
  font-size: 16px;
}
.comment-input {
  width: 100%;
  height: 80px;
  margin-bottom: 10px;
  padding: 8px;
  font-size: 14px;
  resize: none;
}
.submit-button {
  padding: 8px 16px;
  background-color: #274c77;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.submit-button[disabled] {
  background-color: gray;
  cursor: not-allowed;
}
</style>

