<template>
  <Modal :visible="visible" @close="handleClose">
    <div class="album-modal-content">
      <h2>{{ t('album.title') }}</h2>

      <!-- 🎛 カスタムピッカー -->
      <div class="picker-wrapper">
        <label class="picker-label">{{ t('album.selectExisting') }}</label>
        <div class="picker-container">
          <select v-model="selectedAlbum" class="yamato-select custom-picker">
            <option disabled value="">{{ t('album.selectPlaceholder') }}</option>
            <option v-for="name in uniqueAlbumNames" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
        </div>
      </div>

      <!-- ✏️ 新規入力 -->
      <div class="input-wrapper">
        <label class="picker-label">{{ t('album.newInputLabel') }}</label>
        <input
          v-model="newAlbumName"
          class="yamato-input"
          :placeholder="t('album.newInputPlaceholder')"
        />
      </div>

      <!-- 🧭 操作 -->
      <div class="button-group">
        <YamatoButton @click="saveAlbum">{{ t('album.save') }}</YamatoButton>
        <YamatoButton
          v-if="internalPhoto?.albumName"
          @click="clearAlbum"
          class="delete"
        >
          {{ t('album.delete') }}
        </YamatoButton>
      </div>
    </div>
  </Modal>
</template>



<script setup>
import { ref, watch, computed } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { updatePhoto } from '@/graphql/mutations'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import YamatoButton from '@/components/YamatoButton.vue'
import Modal from '@/components/Modal.vue'

const props = defineProps({
  visible: Boolean,
  photo: Object,
  allPhotos: Array
})

const emit = defineEmits(['close', 'updated'])

const selectedAlbum = ref('')
const newAlbumName = ref('')
const internalPhoto = ref(null)

// ✅ props.photo → internalPhoto に反映
watch(() => props.photo, (newVal) => {
  if (newVal) {
    internalPhoto.value = newVal
    selectedAlbum.value = newVal.albumName || ''
    newAlbumName.value = ''
  }
}, { immediate: true })

// ✅ ユニークなアルバム名一覧を生成
const uniqueAlbumNames = computed(() => {
  const names = (props.allPhotos || []).map(p => p.albumName || '').filter(Boolean)
  return [...new Set(names)]
})

// ✅ 保存処理（albumName のみ更新）
const saveAlbum = async () => {
  const albumName = newAlbumName.value.trim() || selectedAlbum.value || ''
  if (!internalPhoto.value) {
    console.warn('⚠️ 保存時に photo が undefined')
    return
  }


  try {
    await API.graphql(graphqlOperation(updatePhoto, {
      input: {
        id: internalPhoto.value.id,
        albumName
      }
    }))
    emit('updated') // 親で fetchAllPhotos などを再実行
    handleClose()
  } catch (e) {
  }
}


const clearAlbum = async () => {
  if (!internalPhoto.value) return
  try {
    await API.graphql(graphqlOperation(updatePhoto, {
      input: {
        id: internalPhoto.value.id,
        albumName: ''
      }
    }))
    emit('updated')
    handleClose()
  } catch (e) {
    console.error('🗑️ アルバム名の削除失敗:', e)
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.album-modal-content {
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  text-align: center;
  /* 背景色は Modal コンポーネントに任せる */
  color: inherit; /* テキスト色も親に任せる */
}

.album-modal-content h2 {
  font-size: 1.4rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.picker-wrapper,
.input-wrapper {
  margin-bottom: 1.3rem;
  text-align: left;
}

.picker-label {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  color: inherit; /* 親の色に従う */
}

.picker-container {
  position: relative;
  margin-top: 0.1rem;
}

.custom-picker {
  width: 100%;
  padding: 0.45rem 0.8rem;
  border-radius: 0.6rem;
  font-size: 0.95rem;
  line-height: 1.2rem;
  appearance: none;
  border: 1px solid #ccc;
  background-color: transparent; /* 背景を透明にして Modal に従う */
  color: inherit;
  margin: 0;
}

.custom-picker:focus {
  outline: none;
  border-color: #888;
}

.picker-container::after {
  content: "⌄";
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.8rem;
  color: #888;
}

.yamato-input {
  width: 100%;
  padding: 0.45rem 0.8rem;
  border-radius: 0.6rem;
  font-size: 0.95rem;
  border: 1px solid #ccc;
  background-color: transparent; /* Modal に任せる */
  color: inherit;
}

.yamato-input::placeholder {
  color: #999;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 1.6rem;
}

.yamato-button,
.YamatoButton {
  padding: 0.5rem 1.6rem;
  font-size: 0.95rem;
  border-radius: 1.6rem;
  border: none;
  background-color: #14532d;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.yamato-button:hover,
.YamatoButton:hover {
  background-color: #166534;
}

.delete {
  background-color: #991b1b !important;
}

.delete:hover {
  background-color: #b91c1c !important;
}
</style>
