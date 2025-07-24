<template>
  <transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <h3>🌤️ 3時間ごとの天気</h3>
        <ul>
          <li v-for="(item, index) in forecastList" :key="index">
            🕒 {{ item.time }}：{{ item.weather }}（{{ item.temp }}℃）
          </li>
        </ul>
        <button @click="close">閉じる</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  forecastList: Array,
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #222;
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: left;
}
</style>

