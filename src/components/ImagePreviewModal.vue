<template>
  <transition name="fade-modal">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-inner-card">
        <!-- 保存ボタン + アニメーションを一緒にラップ -->
        <div class="save-wrapper" v-if="imageLoaded">
          <span v-if="isSaving" :class="iconStage" class="life-icon">
            {{ lifeIcon }}
          </span>
          <IconButton
            class="save-icon"
            :class="{ disabled: isSaving }"
            @click.stop="saveToYamatoPhotos"
            :disabled="isSaving"
          >
            🎞️
          </IconButton>
        </div>

        <img
          :src="imageUrl"
          alt="Preview"
          class="full-image"
          @load="imageLoaded = true"
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { Storage, API, graphqlOperation, Auth } from 'aws-amplify'
import { createPhoto } from '@/graphql/mutations'
import IconButton from '@/components/IconButton.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const imageLoaded = ref(false)
const isSaving = ref(false)

const iconStage = ref('fade-in')
const iconIndex = ref(0)
const icons = ['🌱', '🌷', '🥀']
const lifeIcon = computed(() => icons[iconIndex.value])

let interval = null

const props = defineProps({
  imageUrl: String,
  imageKey: String,
  visible: Boolean,
})

const emit = defineEmits(['close'])
function close() {
  emit('close')
}

// Blob → サムネイル生成
function generateThumbnailFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxDim = 480
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(thumbnailBlob => {
        URL.revokeObjectURL(url)
        if (thumbnailBlob) resolve(thumbnailBlob)
        else reject(new Error('サムネイル生成失敗'))
      }, 'image/jpeg', 0.8)
    }

    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }

    img.src = url
  })
}

async function saveToYamatoPhotos() {
  if (isSaving.value) return

  isSaving.value = true
  iconIndex.value = 0
  iconStage.value = 'fade-in'

  // 🌱 🌷 🥀 アニメーション開始
  interval = setInterval(() => {
    iconStage.value = 'fade-out'
    setTimeout(() => {
      iconIndex.value = (iconIndex.value + 1) % icons.length
      iconStage.value = 'fade-in'
    }, 300)
  }, 1000)

  try {
    if (!props.imageKey) {
      alert('画像キーが指定されていません')
      return
    }

    const timestamp = Date.now()
    const fileName = `chat/${timestamp}-from-chat.jpg`
    const thumbnailFileName = `chat/${timestamp}-thumb.jpg`

    const res = await Storage.get(props.imageKey, {
      level: 'public',
      download: true,
    })
    const originalBlob = res.Body
    const contentType = originalBlob.type || 'image/jpeg'

    const thumbBlob = await generateThumbnailFromBlob(originalBlob)

    await Storage.put(fileName, originalBlob, {
      contentType,
      level: 'protected',
    })

    await Storage.put(thumbnailFileName, thumbBlob, {
      contentType: 'image/jpeg',
      level: 'protected',
    })

    const user = await Auth.currentAuthenticatedUser()
    const owner = user.attributes.sub

    const now = new Date().toISOString()
    const input = {
      fileName,
      thumbnailFileName,
      photoTakenAt: now,
      lastOpenedAt: now,
      isFavorite: false,
      owner,
    }

    await API.graphql(graphqlOperation(createPhoto, { input }))
    alert(t('photo.saved'))
  } catch (e) {
    console.error('❌ 保存失敗', e)
    alert('保存に失敗しました')
  } finally {
    isSaving.value = false
    clearInterval(interval)
    iconStage.value = ''
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-inner-card {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  max-width: 100%;
  max-height: 100%;
  position: relative;
}

.save-wrapper {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
}

.save-icon {
  font-size: 1.6rem;
}

.save-icon.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.life-icon {
  font-size: 1.4rem;
  margin-right: 0.4rem;
}

.full-image {
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  display: block;
}

@media (max-width: 600px) {
  .full-image {
    max-width: 90vw;
    max-height: 80vh;
  }
}

.fade-in {
  opacity: 1;
  transition: opacity 0.3s;
}

.fade-out {
  opacity: 0;
  transition: opacity 0.3s;
}
</style>


