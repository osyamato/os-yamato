<template>
  <transition name="fade-modal">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-inner-card">
        <!-- ⬇️ 保存ボタン（画像読み込み後に表示） -->
        <IconButton
          class="save-icon"
          v-if="imageLoaded"
          @click.stop="saveToYamatoPhotos"
        >🎞️</IconButton>

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
import { Storage, API, graphqlOperation } from 'aws-amplify'
import { createPhoto } from '@/graphql/mutations'
import IconButton from '@/components/IconButton.vue'
import { Auth } from 'aws-amplify' 
import { ref } from 'vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const imageLoaded = ref(false)


const props = defineProps({
  imageUrl: String,     // fallback 表示用
  imageKey: String,     // 保存に使う Storage キー
  visible: Boolean,
})

const emit = defineEmits(['close'])
function close() {
  emit('close')
}

// 🔧 Blob → サムネイルを生成する関数
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
  try {
    if (!props.imageKey) {
      alert('画像キーが指定されていません')
      return
    }

    const timestamp = Date.now()
    const fileName = `chat/${timestamp}-from-chat.jpg`
    const thumbnailFileName = `chat/${timestamp}-thumb.jpg`

    console.log('🪵 imageKey:', props.imageKey)

    // ✅ S3 から Blob を取得
    const res = await Storage.get(props.imageKey, {
      level: 'public',
      download: true,
    })
    const originalBlob = res.Body
    const contentType = originalBlob.type || 'image/jpeg'

    // 🔽 サムネイル生成
    const thumbBlob = await generateThumbnailFromBlob(originalBlob)

    // 🔽 オリジナル保存
    await Storage.put(fileName, originalBlob, {
      contentType,
      level: 'protected',
    })

    // 🔽 サムネイル保存
    await Storage.put(thumbnailFileName, thumbBlob, {
      contentType: 'image/jpeg',
      level: 'protected',
    })

    // ✅ Cognito から owner を取得
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.attributes.sub

    // 🔽 DB 登録
    const now = new Date().toISOString()
    const input = {
      fileName,
      thumbnailFileName,
      photoTakenAt: now,
      lastOpenedAt: now,
      isFavorite: false,
      owner, // ← 🔑 これが必須
    }

    console.log('🪵 createPhoto input:', input)

    const result = await API.graphql(graphqlOperation(createPhoto, { input }))
    console.log('✅ Photo 登録完了:', result)

alert(t('photo.saved'))
  } catch (e) {
    console.error('❌ 保存失敗', e)

    if (e?.errors) {
      console.error('❌ GraphQL エラー:', e.errors.map(err => err.message).join('\n'))
    } else if (e?.response) {
      console.error('❌ Axios レスポンスエラー:', {
        status: e.response.status,
        data: e.response.data,
      })
    } else {
      console.error('❌ 予期しないエラー:', e)
    }

    alert('保存に失敗しました')
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

.save-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.6rem;
  z-index: 10;
}

.full-image {
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  display: block;
}

/* 📱 スマホでは少し小さめに表示 */
@media (max-width: 600px) {
  .full-image {
    max-width: 90vw;
    max-height: 80vh;
  }
}

</style>
