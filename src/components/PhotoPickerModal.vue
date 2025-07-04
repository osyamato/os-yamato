<template>
  <div class="photo-modal-overlay" @click.self="$emit('close')">
    <div class="photo-modal-card">
      <!-- ヘッダー -->
      <div class="modal-header">
        <button
          class="favorite-toggle-button"
          @click="showFavoritesOnly = !showFavoritesOnly"
          :class="{ active: showFavoritesOnly }"
        >
          ♡
        </button>
        <button class="send-button" @click="sendPhoto">⇧</button>
      </div>

      <div class="photo-grid">
        <div
          v-for="(photo, index) in filteredPhotos"
          :key="photo.id"
          class="photo-item"
          @click="selectPhoto(photo)"
          :class="{ selected: selectedPhoto?.id === photo.id }"
        >
          <img
            :src="thumbnailUrls[index]"
            alt="photo"
            class="thumbnail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { listPhotos } from '@/graphql/queries'

const emit = defineEmits(['send', 'close'])

const photos = ref([])
const thumbnailUrls = ref([])
const showFavoritesOnly = ref(false)
const selectedPhoto = ref(null)

const filteredPhotos = computed(() => {
  return showFavoritesOnly.value
    ? photos.value.filter(p => p.isFavorite)
    : photos.value
})

function selectPhoto(photo) {
  selectedPhoto.value = photo
}

async function sendPhoto() {
  try {
    const photo = selectedPhoto.value
    if (!photo) return

    const timestamp = Date.now()
    const baseName = photo.fileName.split('/').pop()
    const thumbBase = photo.thumbnailFileName.split('/').pop()
    const imageKey = `chat/${timestamp}_${baseName}`
    const thumbnailKey = `chat/thumb_${timestamp}_${thumbBase}`

    const [fullUrl, thumbUrl] = await Promise.all([
      Storage.get(photo.fileName, { level: 'protected' }),
      Storage.get(photo.thumbnailFileName, { level: 'protected' })
    ])

    const [fullBlob, thumbBlob] = await Promise.all([
      fetch(fullUrl).then(res => res.blob()),
      fetch(thumbUrl).then(res => res.blob())
    ])

    await Storage.put(imageKey, fullBlob, {
      level: 'public',
      contentType: fullBlob.type
    })
    await Storage.put(thumbnailKey, thumbBlob, {
      level: 'public',
      contentType: thumbBlob.type
    })

    const thumbPreviewUrl = await Storage.get(thumbnailKey, { level: 'public' })

    console.log('✅ emit 送信前:', { imageKey, thumbnailKey, previewUrl: thumbPreviewUrl })

    // ✅ 修正：先に send emit
    emit('send', {
      imageKey,
      thumbnailKey,
      previewUrl: thumbPreviewUrl,
      fileName: photo.fileName,
      thumbnailFileName: photo.thumbnailFileName,
      isTemporary: false
    })

    emit('close')

    console.log('✅ 写真送信処理完了')
  } catch (err) {
    console.error('❌ 写真送信処理に失敗:', err)
  }
}

onMounted(async () => {
  try {
    const res = await API.graphql(graphqlOperation(listPhotos, {
      sortDirection: 'DESC',
      limit: 100
    }))
    const items = res.data.listPhotos.items
    photos.value = items

    thumbnailUrls.value = await Promise.all(
      items.map(photo =>
        Storage.get(photo.thumbnailFileName, { level: 'protected' })
      )
    )
  } catch (err) {
    console.error('❌ 写真の取得に失敗:', err)
  }
})
</script>

<style scoped>
.photo-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.photo-modal-card {
  background: white;
  border-radius: 20px;
  padding: 0.6rem 0.8rem;
  width: 82vw;
  max-width: 740px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: flex-start;
  padding: 0.2rem 0.2rem 0.4rem;
}

.favorite-toggle-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #aaa;
  transition: color 0.2s ease;
}

.favorite-toggle-button.active {
  color: #ff4d6d;
}

.send-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #555;
  margin-left: auto;
  padding: 0 0.4rem;
  transition: color 0.2s ease;
}
.send-button:hover {
  color: #007aff;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.2rem;
  justify-items: center;
}

.photo-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.05);
}

.photo-item:hover {
  transform: scale(1.05);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
}

.photo-item.selected {
  outline: 2px solid #007aff;
}

.thumbnail {
  width: 100%;
  max-width: 68px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
}

@media (prefers-color-scheme: dark) {
  .photo-modal-card {
    background: #2c2c2e;
  }
}
</style>


