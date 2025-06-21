<template>
  <div class="view-wrapper">
    <h2 class="header-title">動画</h2>

    <!-- 🎛️ ヘッダー操作ボタン -->
    <div class="header-actions">
      <div class="header-button-row">
        <IconButton :color="iconColor" @click="triggerFileInput">＋</IconButton>
        <IconButton :color="iconColor">♡</IconButton>
        <IconButton :color="iconColor">☑️</IconButton>
        <IconButton :color="iconColor">🥀</IconButton>
      </div>
      <div v-if="(isLoading || isDeleting) && iconStage" class="upload-life-cycle">
        <div :class="iconStage">{{ lifeIcon }}</div>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="video/*" @change="handleFileSelect" hidden />

<div class="media-grid">
  <div
    v-for="video in videoList"
    :key="video.id"
    class="media-item"
    @click="openModal(video)"
  >
    <div class="thumbnail-wrapper">
      <img :src="video.thumbnailUrl" class="thumbnail" />
      <div class="duration-overlay" v-if="video.duration">
        {{ formatDuration(video.duration) }}
      </div>
      <!-- ↓ このハートを削除 -->
      <!--
      <span
        class="favorite-icon"
        :class="{ active: video.isFavorite }"
        @click.stop="toggleFavorite(video)"
      >
        ♡
      </span>
      -->
    </div>
    <div class="date-label" v-if="video.videoTakenAt || video.createdAt">
      {{ formatDate(video) }}
    </div>
  </div>
</div>

    <!-- 🌙 動画モーダル -->
    <div v-if="selectedVideo" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <!-- 🎛️ 動画上にツールバー -->
        <div class="modal-toolbar">
          <span
            class="toolbar-icon"
            :class="{ active: selectedVideo?.isFavorite }"
            @click.stop="toggleFavorite(selectedVideo)"
          >♡</span>
          <span
            class="toolbar-icon"
            @click.stop="promptDeleteVideo(selectedVideo)"
          >🗑️</span>
        </div>

        <!-- 🎥 再生動画 -->
        <div class="video-wrapper">
          <video
            :src="selectedVideoUrl"
            controls
            autoplay
            playsinline
            class="video-player"
          ></video>
        </div>
      </div>
    </div>

    <!-- ✅ 削除確認 -->
    <ConfirmDialog
      v-if="showConfirm"
      :visible="showConfirm"
      :message="confirmMessage"
      @confirm="handleConfirmedDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { ref, onMounted, computed, watch } from 'vue'
import { Storage, API, graphqlOperation, Auth } from 'aws-amplify'
import { listVideos } from '@/graphql/queries'
import { createVideo, updateVideo, deleteVideo as deleteVideoMutation } from '@/graphql/mutations'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import IconButton from '@/components/IconButton.vue'

const videoList = ref([])
const selectedVideo = ref(null)
const selectedVideoUrl = ref('')
const showConfirm = ref(false)
const confirmMessage = ref('')
const pendingDeleteVideos = ref([])

const isLoading = ref(false)
const isDeleting = ref(false)

const iconStage = ref('fade-in')
const iconIndex = ref(0)
const icons = ['🌱', '🌷', '🥀']
const lifeIcon = computed(() => icons[iconIndex.value])

const iconColor = ref('#274c77')
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

  isLoading.value = true
  try {
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.attributes.sub

    await Storage.put(fileName, file, {
      contentType: file.type,
      level: 'protected'
    })

    const placeholderResponse = await fetch('/video.png')
    const placeholderBlob = await placeholderResponse.blob()

    await Storage.put(thumbFileName, placeholderBlob, {
      contentType: 'image/png',
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
  } finally {
    isLoading.value = false
  }
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
  // まずローカルで即反映（見た目用）
  video.isFavorite = !video.isFavorite;

  // サーバーにも保存（非同期）
  const input = { id: video.id, isFavorite: video.isFavorite };
  API.graphql(graphqlOperation(updateVideo, { input })).catch((err) => {
    console.error('❤️ お気に入り更新失敗:', err);
  });
}

function promptDeleteVideo(video) {
  confirmMessage.value = t('confirm.deleteSingle')
  pendingDeleteVideos.value = [video]
  showConfirm.value = true
}

async function handleConfirmedDelete() {
  console.log('✅ handleConfirmedDelete 実行開始')
  isDeleting.value = true
  try {
    for (const video of pendingDeleteVideos.value) {
      console.log('📦 削除ファイル:', video.fileName)
      await Storage.remove(video.fileName, { level: 'protected' })
      await Storage.remove(video.thumbnailFileName, { level: 'protected' })
      await API.graphql(graphqlOperation(deleteVideoMutation, { input: { id: video.id } }))
      console.log('✅ DynamoDB 削除完了:', video.id)
    }
    showConfirm.value = false
    selectedVideo.value = null
    await fetchVideos()
  } catch (e) {
    console.error('❌ 削除失敗:', e)
    alert('削除に失敗しました')
  } finally {
    isDeleting.value = false
  }
}

function cancelDelete() {
  showConfirm.value = false
  pendingDeleteVideos.value = []
}

function formatDuration(seconds) {
  if (!seconds) return ''
  const min = Math.floor(seconds / 60)
  const sec = String(seconds % 60).padStart(2, '0')
  return `${min}:${sec}`
}

function formatDate(video) {
  const iso = video.videoTakenAt || video.createdAt
  if (!iso) return ''
  const date = new Date(iso)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

let interval = null
watch([isLoading, isDeleting], ([loading, deleting]) => {
  clearInterval(interval)
  if (loading || deleting) {
    iconIndex.value = 0
    iconStage.value = 'fade-in'
    interval = setInterval(() => {
      iconStage.value = 'fade-out'
      setTimeout(() => {
        iconIndex.value = (iconIndex.value + 1) % icons.length
        iconStage.value = 'fade-in'
      }, 300)
    }, 1000)
  } else {
    iconStage.value = ''
  }
})
</script>



<style scoped>
.view-wrapper {
  display: flex;
  flex-direction: column;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* スマホ基準：3列 */
  gap: 1rem;
  justify-items: center;
}

@media (min-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(6, 1fr); /* PC基準：6列 */
  }
}

.media-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 160px;
}

.thumbnail-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
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

.date-label {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #ccc;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.91);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
}

.modal-card {
  position: relative;
  background: #333; /* ← 常に濃いグレーに（明度調整可） */
  color: #eee;       /* テキストが読めるように白っぽく */
  border-radius: 12px;
  padding: 1rem;
  max-width: 90vw;
  max-height: 80vh;
  overflow: visible; /* ← ツールバーが隠れないように */
}

.video-wrapper {
  padding-top: 3.5rem; /* ← ツールバー分の余白を確保 */
}

.video-player {
  width: 100%;
  max-height: 60vh;
  border-radius: 10px;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.header-button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.upload-life-cycle {
  font-size: 1.6rem;
  transition: opacity 0.3s ease;
  text-align: center;
  height: 2rem;
}

.upload-life-cycle > div {
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform-origin: center;
}

.fade-in {
  opacity: 1;
}
.fade-out {
  opacity: 0;
}

.modal-toolbar {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1.2rem;
  z-index: 2000;
  /* background: none; ← 削除 or コメントアウト */
  padding: 0;           /* ← 内側余白なし */
  border-radius: 0;     /* ← 枠も不要 */
}

.toolbar-icon {
  font-size: 1.2rem;
  padding: 0.4rem;
  cursor: pointer;
  color: #888; /* ← 明るめのグレーでライトモードでも見やすく */
  transition: transform 0.2s ease, color 0.2s ease;
  line-height: 1;
}

.toolbar-icon.active {
  color: #f6a4a4; /* お気に入り状態で淡い赤に */
}

@media (prefers-color-scheme: dark) {
  .modal-card {
    background: #222;
    color: #eee;
  }
  .toolbar-icon {
    color: #eee;
  }
  .toolbar-icon.active {
    color: #f88;
  }
}

.confirm-dialog {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

