<template>
  <div>
    <h2>Yamato GPT Mini 🌿</h2>
    <textarea v-model="prompt" placeholder="質問を入力..."></textarea>

    <div>
      <label>モード:</label>
      <select v-model="mode">
        <option value="breeze">🍃 そよ風</option>
        <option value="deep">🌊 深い思索</option>
        <option value="poetic">✨ 詩的</option>
      </select>

      <label>言語:</label>
      <select v-model="language">
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </div>

    <button @click="send">送信</button>

    <div v-if="response">
      <h3>AIからの返答:</h3>
      <p>{{ response }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const prompt = ref('')
const mode = ref('breeze')
const language = ref('ja')
const response = ref('')

async function send() {
  try {
    const res = await fetch('https://tfxc3pudv4.execute-api.ap-northeast-1.amazonaws.com/Yamato_GPT_mini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.value, mode: mode.value, language: language.value })
    })

    if (!res.ok) {
      console.error('❌ API error:', res.status, res.statusText)
      response.value = `Error: ${res.status}`
      return
    }

    const data = await res.json()
    response.value = data.text
  } catch (error) {
    console.error('❌ Fetch failed:', error)
    response.value = '通信エラーが発生しました'
  }
}
</script>

<style scoped>
textarea {
  width: 100%;
  height: 100px;
}
select, button {
  margin: 5px;
}
</style>

