<template>
  <transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-card" @click.stop :class="{ dark: isDarkMode }">
        <h2>🌤️ プロフィール編集</h2>

        <!-- アイコン選択 -->
        <div class="icon-list">
          <!-- 未選択時：ニックネーム頭文字 -->
<div
  class="icon-circle"
  :class="{ selected: icon === '' }"
  style="background-color: #888;"
  @click="icon = ''"
>
  <span class="icon-initial" style="color: white;">
    {{ nickname?.charAt(0) || '？' }}
  </span>
</div>

          <!-- 画像アイコン -->
          <div
            v-for="filename in iconFilenames"
            :key="filename"
            class="icon-circle"
            :class="{ selected: icon === filename }"
            @click="icon = filename"
          >
            <img :src="`/${filename}`" alt="icon" />
          </div>
        </div>

        <!-- 入力項目 -->
        <label>ニックネーム</label>
        <input v-model="nickname" />

        <label>Yamato ID</label>
        <input v-model="yamatoId" />

        <label>紹介文（100文字以内）</label>
        <textarea v-model="bio" maxlength="100" />

        <!-- 保存ボタン（中央） -->
        <div class="buttons center">
          <yamato-button size="small" @click="saveProfile">
            保存
          </yamato-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { updateWeatherProfile } from '@/graphql/mutations'
import YamatoButton from '@/components/YamatoButton.vue'

const props = defineProps({
  visible: Boolean,
  profile: Object
})
const emit = defineEmits(['close', 'refresh'])

const icon = ref('')
const nickname = ref('')
const yamatoId = ref('')
const bio = ref('')

const iconFilenames = [
  'weather.icon1.png', 'weather.icon2.png', 'weather.icon3.png',
  'weather.icon4.png', 'weather.icon5.png', 'weather.icon6.png',
  'weather.icon7.png', 'weather.icon8.png', 'weather.icon9.png', 'weather.icon10.png'
]

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

watch(() => props.visible, (newVal) => {
  if (newVal && props.profile) {
    icon.value = props.profile.icon || ''
    nickname.value = props.profile.nickname || ''
    yamatoId.value = props.profile.yamatoId || ''
    bio.value = props.profile.bio || ''
  }
})

const close = () => emit('close')

const saveProfile = async () => {
  try {
    const input = {
      id: props.profile.id,
      sub: props.profile.sub,
      icon: icon.value,
      nickname: nickname.value,
      yamatoId: yamatoId.value,
      bio: bio.value
    }
    await API.graphql(graphqlOperation(updateWeatherProfile, { input }))
    emit('refresh') // ✅ 自動更新
    close()         // ✅ 静かに閉じる
  } catch (error) {
    console.error('❌ 保存エラー:', error)
    alert('保存に失敗しました')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  color: black;
}

.modal-card.dark {
  background: #222;
  color: white;
}

.icon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-circle.selected {
  border: 2px solid #274c77;
}

.icon-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-initial {
  font-size: 18px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: inherit;
  color: inherit;
}

.buttons.center {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
