<template>
  <div class="account-view">
<h2 class="header-title">アカウント</h2>

    <!-- サインアウト -->
    <div class="account-item">
      <span>サインアウト</span>
      <button class="arrow-button" @click="showSignOutModal = true">→</button>
    </div>

    <!-- プレミアム -->
    <div class="account-item">
      <span>Yamato プレミアム</span>
      <button class="arrow-button" @click="showPremiumModal = true">→</button>
    </div>

    <!-- アカウント削除 -->
    <div class="account-item">
      <span>アカウント削除</span>
      <button class="arrow-button" @click="showDeleteModal = true">→</button>
    </div>

    <!-- 🔻 サインアウトモーダル -->
    <ModalContent :visible="showSignOutModal" @close="showSignOutModal = false">
      <h3>サインアウト</h3>
      <p>本当にサインアウトしますか？</p>
      <div class="button-row">
        <YamatoButton @click="confirmSignOut">サインアウト</YamatoButton>
        <YamatoButton @click="showSignOutModal = false">キャンセル</YamatoButton>
      </div>
    </ModalContent>

    <!-- 🔻 プレミアムモーダル -->
    <ModalContent :visible="showPremiumModal" @close="showPremiumModal = false">
      <h3>Yamato プレミアム</h3>
      <p>アップグレードまたはダウングレードを選択してください。</p>
      <div class="button-row">
        <YamatoButton @click="upgrade">アップグレード</YamatoButton>
        <YamatoButton @click="downgrade">ダウングレード</YamatoButton>
      </div>
    </ModalContent>

    <!-- 🔻 アカウント削除モーダル -->
    <ModalContent :visible="showDeleteModal" @close="showDeleteModal = false">
      <h3>アカウント削除</h3>
      <p>この操作は取り消せません。本当に削除しますか？</p>
      <div class="button-row">
        <YamatoButton type="danger" @click="handleDeleteAccount">完全に削除</YamatoButton>
        <YamatoButton @click="showDeleteModal = false">キャンセル</YamatoButton>
      </div>
    </ModalContent>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Auth } from 'aws-amplify'
import { useRouter } from 'vue-router'
import YamatoButton from '@/components/YamatoButton.vue'
import ModalContent from '@/components/Modal.vue'
import '@/assets/variables.css'

const showSignOutModal = ref(false)
const router = useRouter()
const showPremiumModal = ref(false)
const showDeleteModal = ref(false)

async function handleSignOut() {
  await Auth.signOut()
  router.push('/signin')
}

async function handleDeleteAccount() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    await Auth.deleteUser(user)
    router.push('/signin')
  } catch (err) {
    console.error('❌ アカウント削除エラー:', err)
    alert('アカウント削除に失敗しました。')
  }
}

async function confirmSignOut() {
  await Auth.signOut()
  router.push('/signin')
}

function upgrade() {
  alert('アップグレード機能は今後実装されます')
}

function downgrade() {
  alert('ダウングレード機能は今後実装されます')
}
</script>

<style scoped>

.header-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  font-family: var(--yamato-font-title, serif);
  color: var(--yamato-primary);
  margin-bottom: 2rem;
}

.account-view {
  padding: 2rem;
  font-family: "Hiragino Kaku Gothic ProN", sans-serif;
  animation: dropDown 0.4s ease-out;
  color: #111; /* 通常モードでは黒 */
}

@media (prefers-color-scheme: dark) {
  .account-view {
    color: #fff; /* ダークモードでは白 */
  }
}

.title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #444;
  font-size: 1.1rem;
  gap: 1rem; /* ← 文字と矢印の余白を追加 */
}

.arrow-button {
  background-color: var(--yamato-primary);
  color: var(--yamato-text-light);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.arrow-button:hover {
  background-color: var(--yamato-primary-dark);
}

.button-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap; /* 横幅が足りない場合に折り返し */
}

@keyframes dropDown {
  0% { transform: translateY(-30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
