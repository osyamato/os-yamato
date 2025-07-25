<template>
  <transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-card" @click.stop>
        <h2>🌤️ プロフィール編集</h2>

        <!-- アイコン選択 -->
        <div class="icon-list">
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

        <!-- ボタン -->
        <div class="buttons">
          <button @click="saveProfile">保存</button>
          <button class="cancel" @click="close">キャンセル</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API, graphqlOperation } from 'aws-amplify'
import { updateWeatherProfile } from '@/graphql/mutations'

const props = defineProps({
  visible: Boolean,
  profile: Object
})
const emit = defineEmits(['close', 'refresh'])

// フィールド
const icon = ref('')
const nickname = ref('')
const yamatoId = ref('')
const bio = ref('')

// アイコン一覧
const iconFilenames = [
  'weather.icon1.png', 'weather.icon2.png', 'weather.icon3.png',
  'weather.icon4.png', 'weather.icon5.png', 'weather.icon6.png',
  'weather.icon7.png', 'weather.icon8.png', 'weather.icon9.png', 'weather.icon10.png'
]

// モーダルが開いたら初期値反映
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
    alert('✅ プロフィールを更新しました')
    emit('refresh')  // 再読み込み通知
    close()
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
  border: 2px solid transparent;
  cursor: pointer;
}
.icon-circle.selected {
  border-color: #2196f3;
}
.icon-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

input, textarea {
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
button.cancel {
  background: #ccc;
}
button:not(.cancel) {
  background: #2196f3;
  color: white;
}
</style>

