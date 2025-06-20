<template>
  <div class="view-wrapper">
    <h2 class="header-title">動画</h2>

    <!-- 🎛️ ヘッダー操作ボタン -->
    <div class="header-actions">
      <IconButton :color="iconColor" @click="triggerFileInput">＋</IconButton>
      <IconButton :color="iconColor">♡</IconButton>
      <IconButton :color="iconColor">☑️</IconButton>
      <IconButton :color="iconColor">🥀</IconButton>
    </div>

    <!-- 📁 非表示ファイル入力 -->
    <input
      ref="fileInput"
      type="file"
      accept="video/*"
      @change="handleFileSelect"
      hidden
    />

    <!-- 🔄 読み込み中 -->
    <div v-if="isLoading" class="loading">読み込み中...</div>

    <!-- 🎞️ 動画一覧 -->
    <div class="media-grid">
      <div
        v-for="video in videoList"
        :key="video.id"
        class="media-item"
        @click="openModal(video)"
      >
        <img :src="video.thumbnailUrl" class="thumbnail" />
        <div class="duration-overlay">{{ formatDuration(video.duration) }}</div>
        <span class="favorite-icon" :class="{ active: video.isFavorite }" @click.stop="toggleFavorite(video)">♡</span>
      </div>
    </div>

    <!-- 🎬 モーダル再生 -->
    <div v-if="selectedVideo" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <video
          :src="selectedVideoUrl"
          controls
          autoplay
          playsinline
          class="video-player"
        ></video>
        <button class="delete-button" @click="confirmDelete(selectedVideo)">削除</button>
      </div>
    </div>

    <!-- 🗑️ 確認ダイアログ -->
    <ConfirmDialog
      v-if="showConfirm"
      :message="'この動画を削除しますか？'"
      @confirm="deleteVideo"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Storage, API, graphqlOperation, Auth } from 'aws-amplify'
import { listVideos } from '@/graphql/queries'
import { updateVideo, deleteVideo as deleteVideoMutation } from '@/graphql/mutations'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import IconButton from '@/components/IconButton.vue'
import { createVideo } from '@/graphql/mutations'


const videoList = ref([])
const isLoading = ref(false)
const selectedVideo = ref(null)
const selectedVideoUrl = ref('')
const showConfirm = ref(false)

const iconColor = ref('#274c77') // 💡 初期色

const fileInput = ref(null)

function triggerFileInput() {
  fileInput.value?.click()
}

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#274c77'
  } catch (e) {
    console.error('🎨 アイコン色の取得に失敗:', e)
  }

  fetchVideos()
})

async function handleFileSelect(event) {
  const files = event.target.files
  if (!files || files.length === 0) return

  const file = files[0]
  const fileName = `${Date.now()}-${file.name}`
  const thumbFileName = `thumb-${fileName.replace(/\.[^/.]+$/, '')}.jpg`

  try {
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.attributes.sub

    // ✅ 動画の保存
    await Storage.put(fileName, file, {
      contentType: file.type,
      level: 'protected'
    })

    // ✅ 動画からサムネイルを生成
    const thumbnailBlob = await generateThumbnail(file)

    // ✅ サムネイルをS3にアップロード
    await Storage.put(thumbFileName, thumbnailBlob, {
      contentType: 'image/jpeg',
      level: 'protected'
    })

    const input = {
      owner,
      fileName,
      thumbnailFileName: thumbFileName,
      videoTakenAt: new Date().toISOString(),
      isFavorite: false,
      lastOpenedAt: new Date().toISOString()
    }

    await API.graphql(graphqlOperation(createVideo, { input }))
    await fetchVideos()
  } catch (err) {
    console.error('🎥 動画アップロード失敗:', err)
    alert('アップロードに失敗しました。')
  }
}

async function generateThumbnail(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.1
    })

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('サムネイル生成に失敗しました'))
        }
      }, 'image/jpeg', 0.8)
    })

    video.addEventListener('error', (e) => {
      reject(new Error('動画の読み込みに失敗しました'))
    })
  })
}

async function fetchVideos() {
  isLoading.value = true
  try {
    const result = await API.graphql(graphqlOperation(listVideos))
    const items = result.data.listVideos.items

    const enriched = await Promise.all(
      items.map(async (video) => {
        const thumbUrl = await Storage.get(video.thumbnailFileName, { level: 'protected' })
        return { ...video, thumbnailUrl: thumbUrl }
      })
    )

    videoList.value = enriched.sort(
      (a, b) => new Date(b.videoTakenAt || b.createdAt) - new Date(a.videoTakenAt || a.createdAt)
    )
  } finally {
    isLoading.value = false
  }
}

function openModal(video) {
  selectedVideo.value = video
  Storage.get(video.fileName, { level: 'protected' }).then(url => {
    selectedVideoUrl.value = url
  })
}

function closeModal() {
  selectedVideo.value = null
  selectedVideoUrl.value = ''
}

function toggleFavorite(video) {
  const input = { id: video.id, isFavorite: !video.isFavorite }
  API.graphql(graphqlOperation(updateVideo, { input }))
    .then(() => fetchVideos())
}

function confirmDelete(video) {
  selectedVideo.value = video
  showConfirm.value = true
}

async function deleteVideo() {
  const id = selectedVideo.value.id
  await API.graphql(graphqlOperation(deleteVideoMutation, { input: { id } }))
  selectedVideo.value = null
  showConfirm.value = false
  fetchVideos()
}

function formatDuration(seconds) {
  if (!seconds) return ''
  const min = Math.floor(seconds / 60)
  const sec = String(seconds % 60).padStart(2, '0')
  return `${min}:${sec}`
}
</script>

<style scoped>
.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.media-item {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.duration-overlay {
  position: absolute;
  bottom: 4px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 6px;
}

.favorite-icon {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 1.2rem;
  color: #ccc;
}
.favorite-icon.active {
  color: #f66;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  max-width: 90vw;
  max-height: 80vh;
  overflow: auto;
}

.video-player {
  width: 100%;
  max-height: 60vh;
  border-radius: 10px;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
}

</style>


