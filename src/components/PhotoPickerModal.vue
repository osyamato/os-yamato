<template>
  <div class="photo-modal-overlay" @click.self="$emit('close')">
    <div class="photo-modal-card">
      <!-- ♡ & ⇧ -->
      <div class="modal-header">
        <button
          class="favorite-toggle-button"
          @click="showFavoritesOnly = !showFavoritesOnly"
          :class="{ active: showFavoritesOnly }"
        >
          ♡
        </button>

<!-- 📷 送信ボタン -->
<button class="send-button" @click="sendSelectedPhoto">⇧</button>
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

async function sendSelectedPhoto() {
  if (!selectedPhoto.value) return

  try {
    const { fileName, thumbnailFileName } = selectedPhoto.value

    if (!fileName || !thumbnailFileName) {
      console.warn('⚠️ fileName or thumbnailFileName が未定義です:', selectedPhoto.value)
      return
    }

    // 🆔 一意なキー名（アップロード用）
    const timestamp = Date.now()
    const baseName = fileName.replace(/^.*[\\/]/, '')
    const thumbBase = thumbnailFileName.replace(/^.*[\\/]/, '')
    const imageKey = `chat/${timestamp}_${baseName}`
    const thumbnailKey = `chat/thumb_${timestamp}_${thumbBase}`

    // 🟡 まず protected から fetch
    const [fullUrl, thumbUrl] = await Promise.all([
      Storage.get(fileName, { level: 'protected' }),
      Storage.get(thumbnailFileName, { level: 'protected' })
    ])
    const [fullBlob, thumbBlob] = await Promise.all([
      fetch(fullUrl).then(res => res.blob()),
      fetch(thumbUrl).then(res => res.blob())
    ])

    // ✅ public にアップロード
    await Promise.all([
      Storage.put(imageKey, fullBlob, {
        level: 'public',
        contentType: fullBlob.type
      }),
      Storage.put(thumbnailKey, thumbBlob, {
        level: 'public',
        contentType: thumbBlob.type
      })
    ])

    // 🔓 public URL を取得（再確認不要なら省略も可）
    const thumbPreviewUrl = await Storage.get(thumbnailKey, { level: 'public' })

    // ✅ ChatView に通知（アップロード後なので確実）
    emit('send', {
      imageKey,
      thumbnailKey,
      previewUrl: thumbPreviewUrl,
      fileName,
      thumbnailFileName,
      isTemporary: true
    })

    emit('close')
  } catch (err) {
    console.error('❌ 写真の送信に失敗:', err)
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

/* ♡ ボタン */
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

.thumbnail {
  width: 100%;
  max-width: 68px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  .photo-modal-card {
    background: #2c2c2e;
  }
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

.photo-item.selected {
  outline: 2px solid #007aff;
}


</style>
