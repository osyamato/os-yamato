<template>
  <div class="account-view">
    <h2 class="header-title">アカウント</h2>

    <!-- サインアウト -->
    <div class="account-item">
      <span>サインアウト</span>
      <IconButton :color="selectedColor" size="medium" @click="showSignOutModal = true">></IconButton>
    </div>

    <!-- プレミアム -->
    <div class="account-item">
      <span>Yamato サブスクリプション</span>
      <IconButton :color="selectedColor" size="medium" @click="showPremiumModal = true">></IconButton>
    </div>

    <!-- アカウント削除 -->
    <div class="account-item">
      <span>アカウント削除</span>
      <IconButton :color="selectedColor" size="medium" @click="showDeleteModal = true">></IconButton>
    </div>

    <!-- サインアウトモーダル -->
    <ModalContent :visible="showSignOutModal" @close="showSignOutModal = false" customClass="compact">
      <h3 class="modal-title">サインアウト</h3>
      <p>本当にサインアウトしますか？</p>
      <div class="button-row">
        <YamatoButton @click="confirmSignOut">サインアウト</YamatoButton>
        <YamatoButton @click="showSignOutModal = false">キャンセル</YamatoButton>
      </div>
    </ModalContent>

    <!-- プレミアムモーダル -->
<ModalContent :visible="showPremiumModal" @close="showPremiumModal = false" customClass="compact">
  <h3 class="modal-title">Yamato プレミアム</h3>
  <p>
    現在のプラン: <strong>{{ subscriptionStatusDisplay }}</strong><br />
  </p>

  <!-- ✅ Yamatoプレミアム説明モーダル起動リンク -->
  <p class="terms-link">
    <span @click="showPremiumInfoModal = true">Yamatoプレミアムについて</span>
  </p>

  <!-- ✅ 規約リンク -->
  <p class="terms-link">
    <span @click="showTermsModal = true">利用規約およびプライバシーポリシー</span>
  </p>

  <div class="button-row">
    <YamatoButton v-if="subscriptionStatus === 'free'" @click="upgrade">アップグレード</YamatoButton>
    <YamatoButton v-if="subscriptionStatus === 'paid'" @click="downgrade">ダウングレード</YamatoButton>
  </div>
</ModalContent>

<PremiumModal :visible="showPremiumInfoModal" @close="showPremiumInfoModal = false" />
<TermsModal :visible="showTermsModal" @close="showTermsModal = false" type="terms" />

    <!-- アカウント削除モーダル -->
    <ModalContent :visible="showDeleteModal" @close="showDeleteModal = false" customClass="compact">
      <h3 class="modal-title">アカウント削除</h3>
      <p>この操作は取り消せません。本当に削除しますか？</p>
      <div class="button-row">
        <YamatoButton type="danger" @click="handleDeleteAccount">完全に削除</YamatoButton>
        <YamatoButton @click="showDeleteModal = false">キャンセル</YamatoButton>
      </div>
    </ModalContent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'

import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'
import ModalContent from '@/components/Modal.vue'

import TermsModal from '@/components/TermsModal.vue'

import PremiumModal from '@/components/PremiumModal.vue'

const showPremiumInfoModal = ref(false)

const showTermsModal = ref(false)

const router = useRouter()

const selectedColor = ref('#274c77')
const subscriptionStatus = ref('loading')

const showSignOutModal = ref(false)
const showPremiumModal = ref(false)
const showDeleteModal = ref(false)

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  selectedColor.value = user.attributes['custom:iconColor'] || '#274c77'
  subscriptionStatus.value = user.attributes['custom:subscription'] || 'free'
})

const subscriptionStatusDisplay = computed(() =>
  subscriptionStatus.value === 'paid' ? '有料' :
  subscriptionStatus.value === 'free' ? '無料' : '...'
)

async function confirmSignOut() {
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

async function upgrade() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    await Auth.updateUserAttributes(user, { 'custom:subscription': 'paid' })
    subscriptionStatus.value = 'paid'
    alert('✅ 有料プランに変更されました')
  } catch (e) {
    console.error('❌ アップグレード失敗:', e)
    alert('アップグレードに失敗しました')
  }
}

async function downgrade() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    await Auth.updateUserAttributes(user, { 'custom:subscription': 'free' })
    subscriptionStatus.value = 'free'
    alert('✅ 無料プランに戻しました')
  } catch (e) {
    console.error('❌ ダウングレード失敗:', e)
    alert('ダウングレードに失敗しました')
  }
}
</script>

<style scoped>
.header-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #000;
  margin-bottom: 1.2rem;
}
@media (prefers-color-scheme: dark) {
  .header-title {
    color: #fff;
  }
}

.account-view {
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  animation: dropDown 0.4s ease-out;
  color: #111;
  text-align: center; /* ← これを追加 */
font-weight: bold;

}

@media (prefers-color-scheme: dark) {
  .account-view {
    color: #fff;
  }
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #444;
  font-size: 1.1rem;
  gap: 1rem;
}

/* 💡 この行を追加 */
.account-item span {
  font-weight: bold;
}

.button-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.modal-title {
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

@keyframes dropDown {
  0% { transform: translateY(-30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.terms-link {
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.terms-link span {
  color: #007aff;
  cursor: pointer;
  text-decoration: underline;
  margin: 0 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .terms-link span {
    color: #80bfff;
  }
}


</style>

