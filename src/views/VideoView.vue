<template>

<div class="video-view drop-animation">

  <div class="view-wrapper">
<h2 class="header-title">{{ t('video.title') }}</h2>

    <!-- 🎛️ ヘッダー操作ボタン -->
    <div class="header-actions">
      <div class="header-button-row">
        <IconButton :color="iconColor" @click="triggerFileInput">＋</IconButton>
<IconButton
  :color="showFavoritesOnly ? '#fff' : iconColor"
  :class="{ 'favorite-filter': true, active: showFavoritesOnly }"
  @click="toggleFavoritesFilter"
>
  ♡
</IconButton>
<IconButton :color="isSelectionMode ? '#fff' : iconColor" @click="toggleSelectionMode">☑️</IconButton>

<IconButton
  :color="showWiltedOnly ? '#fff' : iconColor"
  :class="{ 'wilted-filter': true, active: showWiltedOnly }"
  @click="toggleWiltedFilter"
>
  🥀
</IconButton>
      </div>
      <div v-if="(isLoading || isDeleting) && iconStage" class="upload-life-cycle">
        <div :class="iconStage">{{ lifeIcon }}</div>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="video/*" @change="handleFileSelect" hidden />

<div v-if="isSelectionMode" class="bulk-toolbar">
 <IconButton
    :color="iconColor"
    @click="downloadSelectedVideos"
  >
    ↓
  </IconButton>

  <!-- 削除 -->
  <IconButton
    :color="iconColor"
    @click="promptDeleteSelectedVideos"
  >
    🗑️
  </IconButton>
</div>


<p v-if="showWiltedOnly" class="wilted-message">
  {{ t('message.memoryFlower') }}
</p>

<div class="media-grid">
<div
  v-for="video in filteredVideos"
  :key="video.id"
  class="media-item"
  :class="{ selected: selectedIds.includes(video.id) }"
  @click="isSelectionMode ? toggleSelected(video.id) : openModal(video)"
>
  <!-- ✅ 左上チェック -->
  <div
    v-if="isSelectionMode"
    class="custom-checkbox"
    :class="{ checked: selectedIds.includes(video.id) }"
  />
  <div class="thumbnail-wrapper">
    <img :src="video.thumbnailUrl" class="thumbnail" />
    <div class="duration-overlay" v-if="video.duration">
      {{ formatDuration(video.duration) }}
    </div>
    <div v-if="isWithered(video)" class="withered-badge">🥀</div>
  </div>
  <div class="date-label" v-if="video.videoTakenAt || video.createdAt">
    {{ formatDate(video) }}
  </div>
</div>
</div>

    <!-- 🌙 動画モーダル -->
    <div v-if="selectedVideo" class="modal-overlay" @click.self="closeModal">
<div class="modal-toolbar">
  <!-- ❤️ お気に入り -->
<span
  class="toolbar-icon"
  @click.stop="downloadVideo"
>↓</span>

<!-- ❤️ お気に入り -->
<span
  class="toolbar-icon"
  :class="{ active: selectedVideo?.isFavorite }"
  @click.stop="toggleFavorite(selectedVideo)"
>♡</span>

<!-- 🗑️ 削除 -->
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
  @cancel="cancelDelete">
</ConfirmDialog>

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

const isUploading = ref(false)
const isFetching = ref(false)
const isDownloading = ref(false)


const showWiltedOnly = ref(false) 


const showFavoritesOnly = ref(false)


const isSelectionMode = ref(false)
const selectedIds = ref([])



function toggleFavoritesFilter() {
  showFavoritesOnly.value = !showFavoritesOnly.value
  fetchVideos(showFavoritesOnly.value)
}

function toggleWiltedFilter() {
  showWiltedOnly.value = !showWiltedOnly.value
}

function toggleSelectionMode() {
  isSelectionMode.value = !isSelectionMode.value
  selectedIds.value = []
}

function toggleSelected(id) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const filteredVideos = computed(() => {
  let list = videoList.value
  if (showFavoritesOnly.value) {
    list = list.filter(video => video.isFavorite)
  }
  if (showWiltedOnly.value) {
    const threshold = Date.now() - 330 * 24 * 60 * 60 * 1000
    list = list.filter(video => new Date(video.lastOpenedAt || video.createdAt) < threshold)
  }
  return list
})

function isWithered(video) {
  const days = 330
  const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const lastViewed = new Date(video.lastOpenedAt || video.createdAt)
  return lastViewed < thresholdDate
}


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

  await fetchVideos({ skipAnimation: true })  // ← アニメーションなしで最初の読み込み
})


const generateThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.setAttribute('muted', true)
    video.setAttribute('playsinline', true)
    video.setAttribute('autoplay', true)
    video.preload = 'metadata'

    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl

    video.onloadedmetadata = async () => {
      try {
        await video.play()
      } catch (_) {}
      video.currentTime = 1
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = (video.videoHeight / video.videoWidth) * 320

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('サムネイル生成失敗'))
        }
        URL.revokeObjectURL(objectUrl)
      }, 'image/jpeg', 0.8)
    }

    video.onerror = () => {
      reject(new Error('動画読み込み失敗'))
    }
  })
}


async function handleFileSelect(event) {
  const files = event.target.files
  if (!files || files.length === 0) return

  const file = files[0]
  const fileName = `${Date.now()}-${file.name}`
  const thumbFileName = `thumb-${fileName.replace(/\.[^/.]+$/, '')}.jpg`

  isUploading.value = true
  isLoading.value = true

  try {
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.attributes.sub

    await Storage.put(fileName, file, {
      contentType: file.type,
      level: 'protected'
    })

    // ✅ フロントエンドで動画からサムネイル生成
    const thumbnailBlob = await generateThumbnail(file)

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
  } finally {
    isUploading.value = false
    isLoading.value = false
  }
}


async function fetchVideos({ skipAnimation = false } = {}) {
  isFetching.value = true
  if (!skipAnimation) isUploading.value = true

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
    isFetching.value = false
    if (!skipAnimation) isUploading.value = false
  }
}

function openModal(video) {
  selectedVideo.value = video

  // 🎥 動画URLを取得
  Storage.get(video.fileName, { level: 'protected' }).then(url => {
    selectedVideoUrl.value = url
  })

  // 🕒 最終閲覧日時を更新
  const now = new Date().toISOString()
  const input = {
    id: video.id,
    lastOpenedAt: now
  }

  API.graphql(graphqlOperation(updateVideo, { input }))
    .then(() => {
      console.log(`🕒 lastOpenedAt を更新しました: ${video.id}`)
      video.lastOpenedAt = now  // 🥀を即座に消すためローカルも更新
    })
    .catch(err => {
      console.error('🕒 lastOpenedAt 更新失敗:', err)
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

function promptDeleteSelectedVideos() {
  if (selectedIds.value.length === 0) return
  confirmMessage.value = t('confirm.deleteMultipleVideos')
  pendingDeleteVideos.value = videoList.value.filter(v => selectedIds.value.includes(v.id))
  showConfirm.value = true
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

watch([isUploading, isDeleting, isDownloading], ([uploading, deleting, downloading]) => {
  clearInterval(interval)

  if (uploading || deleting || downloading) {
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

async function downloadVideo() {
  if (!selectedVideo.value) return

  try {
    const url = await Storage.get(selectedVideo.value.fileName, {
      level: 'protected',
      download: true  // バイナリ取得
    })

    // BlobからURL生成
    const blobUrl = window.URL.createObjectURL(url.Body)

    // ダウンロード用リンク作成
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = selectedVideo.value.fileName
    link.click()

    // クリーンアップ
    window.URL.revokeObjectURL(blobUrl)
  } catch (err) {
    console.error('⬇️ ダウンロード失敗:', err)
    alert('動画のダウンロードに失敗しました。')
  }
}

async function downloadSelectedVideos() {
  if (selectedIds.value.length === 0) return

  isDownloading.value = true

  try {
    for (const id of selectedIds.value) {
      const video = videoList.value.find(v => v.id === id)
      if (!video) continue

      const result = await Storage.get(video.fileName, {
        level: 'protected',
        download: true
      })
      const blobUrl = window.URL.createObjectURL(result.Body)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = video.fileName
      link.click()
      window.URL.revokeObjectURL(blobUrl)
    }
  } catch (err) {
    console.error('⬇️ 複数ダウンロード失敗:', err)
    alert('ダウンロードに失敗しました。')
  } finally {
    isDownloading.value = false
  }
}

</script>



<style scoped>

.video-view {
  padding: 2rem;
  text-align: center;
}

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

  position: relative; /* ← ✅ これを追加 */
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
.favorite-filter.active {
  background-color: #fff;
  color: #f66; /* お好みでハートの色も赤っぽく */
}

.withered-badge {
  position: absolute;
  top: 6px;        /* ← bottom → top に変更 */
  left: 6px;       /* ← right → left に変更 */
  background: rgba(200, 200, 200, 0.8); /* グレーの円形背景 */
  color: #a00;     /* 枯れた赤色 */
  border-radius: 50%;
  width: 1.6rem;
  height: 1.6rem;
  font-size: 1.1rem;
  line-height: 1.6rem;
  text-align: center;
  pointer-events: none;
}

.wilted-message {
  margin: 0.5rem 0 1rem;
  font-size: 0.95rem;
  color: #888;
  font-style: italic;
  text-align: center;
  animation: driftFade 3s ease-out forwards;
  opacity: 0;
}

@keyframes driftFade {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  30% {
    transform: translateY(0px);
    opacity: 1;
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
}

.drop-animation {
  animation: dropIn 0.5s ease-out;
}

@keyframes dropIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.media-item.selected {
  border: 2px solid #274c77; /* Yamatoブルー（他のアイコンと統一） */
  border-radius: 12px;
  box-shadow: 0 0 6px rgba(39, 76, 119, 0.4);
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.select-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 1.4rem;
}

.bulk-toolbar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
}

.custom-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: white;
  z-index: 10;
  transition: all 0.2s ease;
  border: 1.5px solid #000; /* 黒線の枠を追加 */
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1); /* 軽く立体感を加える */
}

.custom-checkbox.checked {
  background: #007aff; /* 青 */
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.2l-3.5-3.6L4 14l5 5 10-10-1.5-1.5z"/></svg>');
  background-size: 16px;
  background-position: center;
  background-repeat: no-repeat;
}

</style>

