<template>
  <div class="activity-view">
    <h2>🌿 アクティビティ</h2>

    <div class="activity-item">📄 メモ: {{ counts.memos }}件</div>
    <div class="activity-item">🫂 連絡先: {{ counts.contacts }}件</div>
    <div class="activity-item">📷 写真: {{ counts.photos }}件</div>
    <div class="activity-item">🎥 動画: {{ counts.videos }}件</div>
    <div class="activity-item">💬 チャットルーム: {{ counts.chatRooms }}件</div>

    <p v-if="isOverflow" class="poetic-message">
      花が咲き過ぎるのも如何がでしょうか？
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchAllCounts } from '@/utils/fetchAllCounts'

const counts = ref({
  memos: 0,
  contacts: 0,
  photos: 0,
  videos: 0,
  chatRooms: 0
})

const isOverflow = ref(false)

onMounted(async () => {
  const res = await fetchAllCounts()
  counts.value = res

  // 件数が多いときにメッセージを出す条件
  if (res.memos > 100 || res.contacts > 100 || res.photos > 500) {
    isOverflow.value = true
  }
})
</script>

<style scoped>
.activity-view {
  padding: 24px;
}
.activity-item {
  margin: 8px 0;
  font-size: 1.2rem;
}
.poetic-message {
  margin-top: 20px;
  font-style: italic;
  color: #888;
}
</style>
