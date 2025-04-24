<template>
  <div class="memo">
    <h2>メモ帳</h2>

    <!-- 入力フォーム -->
    <textarea v-model="text" placeholder=""></textarea>
    <!-- 保存ボタン -->
    <button
      @click="saveMemo"
      :disabled="text.trim().length === 0"
      :class="text.trim().length === 0 ? 'btn-disabled' : 'btn-active'"
    >
      保存
    </button>

    <!-- メモ一覧表示 -->
    <ul class="memo-list">
      <li v-for="memo in memos" :key="memo.id" @click="openMemoOptions(memo)">
        <div>{{ memo.content }}</div>
        <small>
          作成: {{ formatDate(memo.createdAt) }}<br />
          <template v-if="memo.updatedAt && memo.updatedAt !== memo.createdAt">
            更新: {{ formatDate(memo.updatedAt) }}
          </template>
        </small>
      </li>
    </ul>

    <!-- 桜アニメーション -->
    <div v-if="showSakura" class="sakura-container">
      <span
        v-for="n in 100"
        :key="n"
        class="sakura"
        :style="randomSakuraStyle(n)"
      ></span>
    </div>

    <!-- 編集・削除モーダル -->
<transition name="memo-modal">
<div v-if="isModalOpen" class="modal" @click="isModalOpen = false">
    <div class="modal-content">
      <!-- 中央テキストエリア -->
      <h3>メモ編集</h3>
      <textarea v-model="editText" placeholder=""></textarea>

      <!-- 更新 & 削除ボタン：中央下に並列配置 -->
      <div class="button-container">
        <button
          @click="updateSelectedMemo"
          :disabled="editText.trim().length === 0"
          :class="editText.trim().length === 0 ? 'btn-disabled' : 'btn-active'"
        >
          保存
        </button>

        <button class="btn-danger" @click="deleteSelectedMemo">
          削除
        </button>
      </div>

      <!-- 閉じるボタン -->
      <div class="close-button" @click="isModalOpen = false">＜</div>
    </div>
  </div>
</transition>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import awsExports from '../aws-exports'
import { createMemo, updateMemo, deleteMemo } from '../graphql/mutations'
import { listMemos } from '../graphql/queries'

Amplify.configure(awsExports)

const text = ref('')
const editText = ref('')
const memos = ref([])
const selectedMemo = ref(null)
const isModalOpen = ref(false)
const showSakura = ref(false)

async function saveMemo() {
  try {
    await API.graphql(graphqlOperation(createMemo, {
      input: { content: text.value }
    }))
    text.value = ''
    await fetchMemos()
  } catch (err) {
    console.error('❌ 保存失敗:', err)
    alert('保存に失敗しました')
  }
}

async function fetchMemos() {
  try {
    const result = await API.graphql(graphqlOperation(listMemos))
    const items = result.data.listMemos.items
    memos.value = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    console.error('❌ 読み込み失敗:', err)
  }
}

function openMemoOptions(memo) {
  selectedMemo.value = memo
  editText.value = memo.content
  isModalOpen.value = true
}

async function updateSelectedMemo() {
  try {
    await API.graphql(graphqlOperation(updateMemo, {
      input: {
        id: selectedMemo.value.id,
        content: editText.value,
        updatedAt: new Date().toISOString()
      }
    }))
    isModalOpen.value = false
    await fetchMemos()
  } catch (err) {
    console.error('更新失敗:', err)
  }
}

async function deleteSelectedMemo() {
  try {
    showSakura.value = true

    // 🌸 アニメ完了まで待ってからモーダル閉じる
    setTimeout(() => {
      showSakura.value = false
      isModalOpen.value = false
    }, 750) // ✅ CSSと一致させる（0.7秒 + α）

    await API.graphql(graphqlOperation(deleteMemo, {
      input: { id: selectedMemo.value.id }
    }))
    await fetchMemos()
  } catch (err) {
    console.error('削除失敗:', err)
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

function randomSakuraStyle(index) {
  const dx = (Math.random() - 0.5) * 300 + 'px'
  const dy = (Math.random() - 0.5) * 300 + 'px'
  const size = 24 + Math.random() * 16
  const imageIndex = (index % 2) + 1
  const duration = '0.7s'

  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url('/sakura${imageIndex}.PNG')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    animationName: 'sakura-pop',
    animationDuration: duration,
    animationTimingFunction: 'linear',
    animationIterationCount: '1',
    animationFillMode: 'forwards',
    transform: 'translate(-50%, -50%)',
    '--dx': dx,
    '--dy': dy,
  }
}


onMounted(() => {
  fetchMemos()
})
</script>

<style scoped>
.memo {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;

  /* ▼ 追加：ふわっと降りる動き */
  animation: dropDown 0.4s ease-out;
  transform-origin: top center;
}


textarea {
  width: 95%;
  max-width: 700px;
  margin: 0 auto 1.5rem auto; /* ✅ 中央寄せにする */
  height: 150px;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #aaa;
  resize: vertical;
  box-sizing: border-box;
}

/* ✅ タブレット・PC表示のときにさらに広くする */
@media (min-width: 768px) {
  textarea {
    max-width: 800px;
    font-size: 1.1rem;
    padding: 1.2rem;
  }
}

/* 入力なし（グレー） */
.btn-disabled {
  background-color: #ccc;
  color: #888;
  cursor: not-allowed;
}

/* 入力あり（薄い青） */
.btn-active {
  background-color: #274c77; /* 和風な淡い青 */
  color: #fff;
  cursor: pointer;
}

button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  transition: background-color 0.3s;
}



.memo-list {
  list-style: none;
  padding: 0;
  width: 100%;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center; /* 中央揃え */
}

.memo-list li {
  width: 92%;
  max-width: 750px;            /* タブレット・PCでも自然な幅 */
  background: #fdfaf6;
  padding: 1.6rem;
  margin-bottom: 1.2rem;
  border-radius: 14px;
  color: #333;
  font-size: 1.15rem;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid #e6e3df;

  word-break: break-word;
  white-space: pre-wrap;
}

.memo-list li:hover {
  background: #efece6;
}

/* ✅ タブレット以上でも広くしすぎない */
@media (min-width: 768px) {
  .memo-list li {
    font-size: 1.2rem;
    padding: 2rem;
    border-radius: 16px;
  }
}

.memo-list li small {
  display: block;
  margin-top: 0.5rem;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.4;
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(248, 245, 239, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative; /* ✅ ゴミ箱を右上に置くために追加 */
  background: #f9f6f1;
  padding: 2rem 1.5rem 1.5rem;
  border-radius: 1rem;
  text-align: center;
  width: 92%;
  max-width: 800px;
}

.modal-content textarea {
  width: 95%;
  max-width: 560px;          /* ✅ モーダル幅に収まるように調整 */
  height: 100px;
  margin: 1.2rem auto;
  font-size: 1.1rem;
  padding: 1.2rem;
  border-radius: 10px;
  border: 1px solid #aaa;
  resize: vertical;
  box-sizing: border-box;
  display: block;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .modal-content textarea {
    height: 220px;
    font-size: 1.15rem;
    padding: 1.4rem;
  }
}

.btn-danger {
  background-color: #cc3d3d;
  color: #fff;
  cursor: pointer;
  margin-left: 0.8rem;
}


/* ✅ ゴミ箱ボタン（右上） */
.delete-button {
  all: unset; /* ← すべてのボタンスタイルをリセット */
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  font-size: 1.2rem;
  color: #666; /* グレーでシンプルに */
  cursor: pointer;
  transition: color 0.2s;
}

.delete-button:hover {
  color: #333; /* 少し濃くしてホバー感を演出 */
}



/* ✅ 更新ボタン（中央下） */
.btn-disabled {
  background-color: #ccc;
  color: #888;
  cursor: not-allowed;
}

.btn-active {
  background-color: #274c77; /* 濃くて落ち着いた和風青 */
  color: #fff;
  cursor: pointer;
}

button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  transition: background-color 0.3s;
}

/* ✅ ＜ 戻るボタン（下中央） */
.close-button {
  margin-top: 1.5rem;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  display: inline-block;
}
.sakura-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}


.sakura {
  position: absolute;
  top: -200px; /* 十分に上から出す */
  opacity: 0; /* 最初は透明 */
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  animation-name: fall-sway;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

</style>

<style>

@keyframes sakura-pop {
  0% {
    transform: scale(0.3) translate(0, 0);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5) translate(var(--dx), var(--dy));
    opacity: 0;
  }
}


@keyframes dropDown {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes flyUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
}

/* モーダルが表示されるとき */
.memo-modal-enter-active {
  animation: dropDown 0.4s ease-out;
}

/* モーダルが非表示になるとき */
.memo-modal-leave-active {
  animation: flyUp 0.4s ease-in forwards;
}


</style>
