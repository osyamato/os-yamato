<template>
  <div class="photo-view drop-animation">
    <!-- 🔵 タイトル -->
    <div class="photo-header">
      <h2 class="header-title">写真</h2>
 </div>
<!-- フィルターヘッダー -->
<div class="header-actions">
  <!-- ＋ ボタン -->
  <button class="circle-file-button" @click="triggerFileInput">
    ＋
  </button>
  <input
    ref="fileInput"
    type="file"
    accept="image/*"
    multiple
    @change="handleFileUpload"
    style="display: none"
  />

  <!-- ♡ フィルター -->
  <button
    class="circle-heart-filter"
    :class="{ active: filterFavoritesOnly }"
    @click="toggleHeartFilter"
  >
    ♡
  </button>

  <!-- ☑️ 選択モード -->
  <button
    class="circle-check-filter"
    :class="{ active: isSelectionMode }"
    @click="toggleSelectionMode"
  >
    ☑️
  </button>

  <!-- 🥀 経過フィルター -->
  <button
    class="circle-wilt-filter"
    :class="{ active: filterWiltingOnly }"
    @click="toggleWiltFilter"
  >
    🥀
  </button>
</div>

    <div v-if="isLoading && iconStage" class="upload-life-cycle">
      <span :class="'icon-seedling ' + iconStage">{{ lifeIcon }}</span>
    </div>

    <div v-if="isSelectionMode" class="floating-delete">
      <button class="bulk-delete-button" @click.stop="deleteSelectedPhotos">
        🗑
      </button>
    </div>

    <p class="wilted-message" v-if="filterWiltingOnly">
      記憶の花は、いつか風に散る
    </p>

    <!-- 写真グリッド -->
    <div class="photo-grid">
      <div
        v-for="photo in photoList"
        :key="photo.id"
        class="photo-card"
        :class="{ selected: isSelectionMode && selectedPhotoIds.includes(photo.id) }"
        @click="isSelectionMode ? toggleSelection(photo.id) : openModal(photo)"
      >
        <img
          :src="photo.thumbnailUrl"
          class="photo-thumbnail"
          style="cursor: pointer"
        />

        <span v-if="isWilting(photo)" class="wilt-icon">🥀</span>

        <div
          v-if="isSelectionMode && selectedPhotoIds.includes(photo.id)"
          class="check-overlay"
        >
          ☑️
        </div>

        <div class="photo-info">
          <p class="filename">
            📷 {{ photo.fileName }}<span v-if="isWilting(photo)">🥀</span>
          </p>
          <p class="timestamp">撮影日時: {{ formatDate(photo.photoTakenAt) }}</p>
          <div class="photo-actions">
            <button
              @click.stop="toggleFavorite(photo)"
              class="favorite-button"
            >
              {{ photo.isFavorite ? '❤️' : '🤍' }}
            </button>
            <button
              @click.stop="deletePhoto(photo)"
              class="delete-button"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- モーダル表示 -->
    <div
      v-if="modalVisible"
      class="modal-overlay"
      :class="{ closing: modalClosing }"
      @click="startModalClose"
    >
      <div class="modal-content-wrapper" @click.stop>
        <div v-if="isImageLoaded" class="modal-toolbar-centered">
          <span
            class="modal-favorite-icon"
            :class="{ active: currentPhoto?.isFavorite }"
            @click.stop="toggleFavorite(currentPhoto)"
          >♡</span>

          <span class="modal-date-text" v-if="currentPhoto?.photoTakenAt">
            {{ formatDate(currentPhoto.photoTakenAt) }}
          </span>

          <button
            class="modal-delete-button-above"
            @click.stop="deletePhoto(currentPhoto)"
          >🗑</button>
        </div>

        <div class="modal-content">
          <div v-if="!isImageLoaded" class="upload-life-cycle">
            <span :class="'icon-seedling ' + iconStage">{{ lifeIcon }}</span>
          </div>
          <img
            v-show="false"
            :src="fullImageUrl"
            @load="isImageLoaded = true"
          />
          <div v-if="isImageLoaded" class="modal-image-wrapper">
            <img :src="fullImageUrl" class="full-image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Storage, API, graphqlOperation, Auth } from 'aws-amplify'
import { createPhoto, updatePhoto, deletePhoto as deletePhotoMutation } from '@/graphql/mutations'
import { listPhotos } from '@/graphql/queries'
import exifr from 'exifr'

const photoList = ref([])
const modalVisible = ref(false)
const modalClosing = ref(false)
const fullImageUrl = ref(null)
const isImageLoaded = ref(false)
const currentPhoto = ref(null)
const filterFavoritesOnly = ref(false)
const isLoading = ref(false)


const filterWiltingOnly = ref(false)

const isSelectionMode = ref(false)
const selectedPhotoIds = ref([])
function toggleWiltFilter() {
  filterFavoritesOnly.value = false
  isSelectionMode.value = false
  filterWiltingOnly.value = !filterWiltingOnly.value
}

function toggleHeartFilter() {
  filterWiltingOnly.value = false
  isSelectionMode.value = false
  filterFavoritesOnly.value = !filterFavoritesOnly.value
}

function toggleSelectionMode() {
  filterFavoritesOnly.value = false
  filterWiltingOnly.value = false
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) {
    selectedPhotoIds.value = []
  }
}

function toggleSelection(photoId) {
  const id = photoId.toString()
  const current = [...selectedPhotoIds.value] // 現在の配列のコピーを作成

  if (current.includes(id)) {
    // すでに含まれていれば削除
    selectedPhotoIds.value = current.filter(i => i !== id)
  } else {
    // 含まれていなければ追加
    selectedPhotoIds.value = [...current, id]
  }
}

watch([filterFavoritesOnly, filterWiltingOnly], () => {
  console.log('🥀 フィルター状態:', filterWiltingOnly.value)
  fetchPhotos()
})



const fileInput = ref(null)

function triggerFileInput() {
  fileInput.value?.click()
}

const iconStage = ref('fade-in')
const iconIndex = ref(0)
const icons = ['🌱', '🌷', '🥀']
const lifeIcon = computed(() => icons[iconIndex.value])

let interval = null

watch(isLoading, (val) => {
  clearInterval(interval) // ✅ ← 先に必ず止める！

  if (val) {
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
async function handleFileUpload(event) {
  const files = event.target.files
  if (!files || files.length === 0) return

  isLoading.value = true

  try {
    for (const file of files) {
      await uploadSinglePhoto(file)
    }
    await fetchPhotos()
  } catch (e) {
    console.error('❌ アップロード中エラー:', e)
    alert('アップロードに失敗しました。')
  } finally {
    isLoading.value = false
  }
}

async function uploadSinglePhoto(file) {
  const fileName = `${Date.now()}-${file.name}`
  const thumbFileName = `thumb-${fileName}`

  try {
    const user = await Auth.currentAuthenticatedUser()
    const owner = user.attributes.sub

    await Storage.put(fileName, file, {
      contentType: file.type,
      level: 'protected'
    })

    const imageBitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const maxSize = 300
    const ratio = Math.min(maxSize / imageBitmap.width, maxSize / imageBitmap.height)
    canvas.width = imageBitmap.width * ratio
    canvas.height = imageBitmap.height * ratio
    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height)

    const thumbBlob = await new Promise(resolve => canvas.toBlob(resolve, file.type))
    await Storage.put(thumbFileName, thumbBlob, {
      contentType: file.type,
      level: 'protected'
    })

    let photoTakenAt = null
    try {
      const exif = await exifr.parse(file)
      if (exif?.DateTimeOriginal) {
        photoTakenAt = new Date(exif.DateTimeOriginal).toISOString()
      }
    } catch (e) {
      console.warn('📸 EXIF 読み取り失敗:', e)
    }

    const input = {
      owner,
      fileName,
      thumbnailFileName: thumbFileName,
      photoTakenAt,
      isFavorite: false,
      lastOpenedAt: new Date().toISOString() // ✅ ここを追加
    }

    await API.graphql(graphqlOperation(createPhoto, { input }))
  } catch (err) {
    console.error('❌ アップロード中エラー:', JSON.stringify(err, null, 2))
    alert('アップロードに失敗しました。')
  }
}

function isWilting(photo) {
  if (!photo.lastOpenedAt) return false
  const days = (Date.now() - new Date(photo.lastOpenedAt)) / (1000 * 60 * 60 * 24)
  return days >= 330
}

async function fetchPhotos() {
  try {
    const result = await API.graphql(graphqlOperation(listPhotos))
    let items = result.data.listPhotos.items

    if (filterFavoritesOnly.value) {
      items = items.filter(item => item.isFavorite)
    }

    if (filterWiltingOnly.value) {
      items = items.filter(item => {
        if (!item.lastOpenedAt) return false
        const days = (Date.now() - new Date(item.lastOpenedAt)) / (1000 * 60 * 60 * 24)
        return days >= 330
      })
    }

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const signedThumbUrl = await Storage.get(item.thumbnailFileName, { level: 'protected' })
          return { ...item, thumbnailUrl: signedThumbUrl }
        } catch (e) {
          console.warn(`🔸 URL取得失敗: ${item.thumbnailFileName}`, e)
          return item
        }
      })
    )

    photoList.value = updatedItems.sort(
      (a, b) => new Date(b.photoTakenAt || b.createdAt) - new Date(a.photoTakenAt || a.createdAt)
    )
  } catch (e) {
    console.error('❌ 写真取得エラー:', e)
  }
}

async function toggleFavorite(photo) {
  try {
    const updated = {
      id: photo.id,
      isFavorite: !photo.isFavorite
    }
    await API.graphql(graphqlOperation(updatePhoto, { input: updated }))
    photo.isFavorite = !photo.isFavorite
    currentPhoto.value = { ...photo }
    await fetchPhotos()
  } catch (err) {
    console.error('❤️ お気に入り切り替え失敗:', err)
  }
}

async function deletePhoto(photo) {
  const confirmed = confirm('この写真を削除しますか？')
  if (!confirmed) return

  try {
    await Storage.remove(photo.fileName, { level: 'protected' })
    await Storage.remove(photo.thumbnailFileName, { level: 'protected' })

    await API.graphql(
      graphqlOperation(deletePhotoMutation, {
        input: { id: photo.id }
      })
    )

    modalVisible.value = false
    fullImageUrl.value = null
    await fetchPhotos()
  } catch (e) {
    console.error('🗑 写真削除エラー:', e)
    alert('削除に失敗しました')
  }
}

async function deleteSelectedPhotos() {
  if (selectedPhotoIds.value.length === 0) {
    alert('写真が選択されていません。')
    return
  }

  const confirmed = confirm('選択した写真をすべて削除しますか？')
  if (!confirmed) return

  try {
    for (const photo of photoList.value) {
      if (selectedPhotoIds.value.includes(photo.id)) {
        await Storage.remove(photo.fileName, { level: 'protected' })
        await Storage.remove(photo.thumbnailFileName, { level: 'protected' })
        await API.graphql(graphqlOperation(deletePhotoMutation, { input: { id: photo.id } }))
      }
    }

    selectedPhotoIds.value = []       // 選択解除
    isSelectionMode.value = false     // モード終了
    await fetchPhotos()               // 再取得

  } catch (e) {
    console.error('🗑 一括削除エラー:', e)
    alert('一部の写真の削除に失敗しました。')
  }
}

async function openModal(photo) {
  try {
    const url = await Storage.get(photo.fileName, { level: 'protected' })
    fullImageUrl.value = url
    isImageLoaded.value = false
    modalClosing.value = false
    modalVisible.value = true
    currentPhoto.value = { ...photo }

    const nowIso = new Date().toISOString()

    // ✅ DynamoDB を更新
    await API.graphql(graphqlOperation(updatePhoto, {
      input: {
        id: photo.id,
        lastOpenedAt: nowIso
      }
    }))

    // ✅ ローカル photoList を即時反映
    const index = photoList.value.findIndex(p => p.id === photo.id)
    if (index !== -1) {
      photoList.value[index].lastOpenedAt = nowIso
    }

  } catch (e) {
    console.error('❌ フル画像の取得失敗:', e)
  }
}

function startModalClose() {
  modalClosing.value = true
  setTimeout(() => {
    modalVisible.value = false
    fullImageUrl.value = null
  }, 300)
}

function formatDate(dateStr) {
  if (!dateStr) return '不明'
  return new Date(dateStr).toLocaleString('ja-JP')
}

onMounted(fetchPhotos)
</script>


<style scoped>
/* アニメーション */
@keyframes dropDown {
  0% { transform: translateY(-40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes flyUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
}
@keyframes scaleFadeIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes scaleFadeOut {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0; }
}

/* 全体 */
.photo-view {
  padding: 2rem;
  text-align: center;
}
.title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* 写真グリッド */
.photo-grid {
  display: grid;
  gap: 0.75rem;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
}
.photo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  background-color: #1a1a1a;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  transition: transform 0.15s ease;
  border: none;
}
.photo-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo-thumbnail:hover {
  transform: scale(1.03);
}
.photo-info {
  padding: 0.5rem;
  font-size: 0.85rem;
  background-color: #111;
  color: #fff;
  text-align: left;
}
.favorite-button,
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}
.delete-button {
  color: #b33;
  margin-left: 0.5rem;
}
.photo-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* モーダル全体 */
.modal-overlay {
  position: fixed;
  overflow: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: dropDown 0.2s ease-out forwards;
}
.modal-overlay.closing {
  animation: flyUp 0.2s ease-in forwards;
}
.modal-content {
  background: transparent;
  padding: 0;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  animation: scaleFadeIn 0.2s ease-out forwards;
  display: block;
  margin: 0 auto;
  position: relative;
}
.modal-overlay.closing .modal-content {
  animation: scaleFadeOut 0.2s ease-in forwards;
}

/* 上部ツールバー */
.modal-content-wrapper {
  position: relative;
}
.modal-toolbar-centered {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.6rem 1rem;
  background-color: transparent;     /* ← ✅ 完全に透明 */
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  backdrop-filter: none;             /* ← ✅ ブラーも消す */
}

.modal-toolbar-centered .modal-date-text {
  position: relative;
  transform: none;
  color: #fff;
  font-size: 0.8rem;
  pointer-events: none;
}

.modal-toolbar-centered .modal-favorite-icon,
.modal-toolbar-centered .modal-delete-button-above {
  color: black; /* ← ライトモード用（デフォルト） */
  background: none;
  border: none;
  font-size: 1.2rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ダークモード用 */
@media (prefers-color-scheme: dark) {
  .modal-toolbar-centered .modal-favorite-icon,
  .modal-toolbar-centered .modal-delete-button-above {
    color: white;
  }
}

/* ハートがアクティブなときは常に赤 */
.modal-favorite-icon.active {
  color: #ff8a8a;
}

/* 画像表示 */
.modal-image-wrapper {
  padding-top: 3.2rem; /* ツールバーの高さに応じて調整 */
}
.full-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

/* ヘッダーボタン群 */
.header-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.circle-file-button,
.circle-heart-filter,
.circle-check-filter,
.circle-wilt-filter {
  background-color: #2b4d77;
  color: #ccc;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.circle-heart-filter.active {
  color: #ff8a8a;
}
.circle-check-filter {
  color: #274c77;
}
.circle-wilt-filter.active {
  color: #f59cbf;
}
.circle-file-button input[type="file"] {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* 選択モード */
.photo-card.selected {
  border: 2px solid #274c77;
  background-color: #f0f4f9;
}
.check-overlay {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 1.2rem;
  color: white;
  background-color: #274c77;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* フィルター中の一言 */
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
  0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(-10px) rotate(-1deg); opacity: 0.85; }
}
.wilt-icon {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 0.95rem;
  background: rgba(0, 0, 0, 0.5);
  color: #f59cbf;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* アップロード中アニメーション */
.upload-life-cycle {
  text-align: center;
  margin: 1rem;
}
.icon-seedling {
  font-size: 1.4rem;
  transition: opacity 0.3s ease;
  display: inline-block;
}
.fade-in {
  opacity: 1;
}
.fade-out {
  opacity: 0;
}

/* 一括削除ボタン */
.floating-delete {
  display: flex;
  justify-content: center;
  margin: 1.2rem 0;
}
.bulk-delete-button {
  background-color: #274c77;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.photo-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.header-title {
  font-size: 1.5rem;
  font-family: 'serif';
  color: var(--yamato-primary);
}
.drop-animation {
  animation: dropDown 0.6s ease-out;
}

</style>

