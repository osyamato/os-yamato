<template>
  <transition name="slide-panel">
    <div class="photo-panel-overlay">
      <div class="photo-panel-card">
        <!-- ヘッダー -->
        <div class="panel-header">
          <button class="close-button" @click="$emit('close')">✕</button>
          <button
            class="favorite-toggle-button"
            @click="showFavoritesOnly = !showFavoritesOnly"
            :class="{ active: showFavoritesOnly }"
          >
            ♡
          </button>
<button
  class="send-button"
  :disabled="!hasSelection"
  @click="sendPhoto"
>
  ⇧
</button>
        </div>

        <!-- スクロール対象エリア -->
        <div class="photo-scroll-area">
          <div class="photo-grid">
            <div
              v-for="(photo, index) in filteredPhotos"
              :key="photo.id"
              class="photo-item"
              :class="{ selected: selectedPhoto?.id === photo.id }"
              @click="toggleSelect(photo)"
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
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { listPhotos } from '@/graphql/queries'

const photos = ref([])
const thumbnailUrls = ref([])
const selectedPhoto = ref(null)
const showFavoritesOnly = ref(false)

const emit = defineEmits(['send', 'close'])

const hasSelection = computed(() => selectedPhoto.value !== null)

const filteredPhotos = computed(() => {
  return showFavoritesOnly.value
    ? photos.value.filter(p => p.isFavorite)
    : photos.value
})

function toggleSelect(photo) {
  selectedPhoto.value = selectedPhoto.value?.id === photo.id ? null : photo
}

async function sendPhoto() {
  try {
    const photo = selectedPhoto.value
    if (!photo) return

    const timestamp = Date.now()
    const baseName = photo.fileName.replace(/^.*[\\/]/, '')
    const thumbBase = photo.thumbnailFileName.replace(/^.*[\\/]/, '')
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

    const previewUrl = await Storage.get(thumbnailKey, { level: 'public' })

    emit('send', {
      imageKey,
      thumbnailKey,
      previewUrl,
      isTemporary: true
    })

    emit('close')
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
    console.error('❌ 写真取得失敗:', err)
  }
})
</script>

<style scoped>
.photo-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

.photo-panel-card {
  width: 100%;
  max-width: 600px;
  height: 65vh;
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem 0.4rem;
  border-bottom: 1px solid #ddd;
  background: white;
}

.close-button,
.favorite-toggle-button,
.send-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
}

.favorite-toggle-button {
  margin-left: 0.8rem;
  color: #aaa;
  transition: color 0.2s ease;
}

.favorite-toggle-button.active {
  color: #ff4d6d;
}

.send-button {
  margin-left: auto;
  color: #274c77;
  transition: transform 0.2s ease;
}

.send-button:hover {
  transform: scale(1.1);
}

.photo-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0.6rem 0.8rem 1rem;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.photo-item {
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.photo-item:hover {
  transform: scale(1.05);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
}

.thumbnail {
  width: 100%;
  max-width: 90px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px;
}

.photo-item.selected {
  border: 3px solid #274c77;
  box-shadow: 0 0 6px rgba(39, 76, 119, 0.5);
}
.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


</style>

<style>
@media (prefers-color-scheme: dark) {
  .photo-panel-card,
  .panel-header {
    background: #1e1e1e !important;
    color: white;
  }
}
</style>
