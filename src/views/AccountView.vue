<template>
  <div class="account-view">
<h2 class="header-title">{{ $t('account.title') }}</h2>
<p class="user-email">{{ userEmail }}</p>

    <!-- サインアウト -->
    <div class="account-item">
      <span>{{ $t('account.signOut') }}</span>
      <IconButton :color="selectedColor" size="medium" @click="showSignOutModal = true">></IconButton>
    </div>

    <!-- プレミアム -->
    <div class="account-item">
      <span>{{ $t('account.subscription') }}</span>
      <IconButton :color="selectedColor" size="medium" @click="showPremiumModal = true">></IconButton>
    </div>

<div class="account-item">
  <span>{{ $t('account.resetPassword') }}</span>
  <IconButton :color="selectedColor" size="medium" @click="goToResetPassword">></IconButton>
</div>

    <!-- アカウント削除 -->
    <div class="account-item">
      <span>{{ $t('account.delete') }}</span>
      <IconButton :color="selectedColor" size="medium" @click="showDeleteModal = true">></IconButton>
    </div>

    <!-- サインアウトモーダル -->
    <ModalContent :visible="showSignOutModal" @close="showSignOutModal = false" customClass="compact">
      <h3 class="modal-title">{{ $t('account.signOut') }}</h3>
      <p>{{ $t('account.confirmSignOut') }}</p>
      <div class="button-row">
        <YamatoButton @click="confirmSignOut">{{ $t('account.signOut') }}</YamatoButton>
        <YamatoButton @click="showSignOutModal = false">{{ $t('common.cancel') }}</YamatoButton>
      </div>
    </ModalContent>

    <!-- プレミアムモーダル -->
<!-- プレミアムモーダル -->
<ModalContent :visible="showPremiumModal" @close="showPremiumModal = false" customClass="compact">
  <h3 class="modal-title">{{ $t('account.premium') }}</h3>
  <p>
    {{ $t('account.currentPlan') }} <strong>{{ subscriptionStatusDisplay }}</strong><br />
  </p>

  <p class="warning-text">{{ $t('account.premiumPreparing') }}</p>

  <p class="terms-link">
    <span @click="showPremiumInfoModal = true">{{ $t('account.aboutPremium') }}</span>
  </p>

  <p class="terms-link">
    <span @click="showTermsModal = true">{{ $t('common.termsAndPrivacy') }}</span>
  </p>

  <!-- ボタンは準備中のため非表示 -->
  <!--
  <div class="button-row">
    <YamatoButton v-if="subscriptionStatus === 'free'" @click="upgrade">{{ $t('account.upgrade') }}</YamatoButton>
    <YamatoButton v-if="subscriptionStatus === 'paid'" @click="downgrade">{{ $t('account.downgrade') }}</YamatoButton>
  </div>
  -->
</ModalContent>


    <PremiumModal :visible="showPremiumInfoModal" @close="showPremiumInfoModal = false" />
    <TermsModal :visible="showTermsModal" @close="showTermsModal = false" type="terms" />

    <!-- アカウント削除モーダル -->
    <ModalContent :visible="showDeleteModal" @close="showDeleteModal = false" customClass="compact">
      <h3 class="modal-title">{{ $t('account.deleteAccount') }}</h3>
      <p>{{ $t('account.confirmDelete') }}</p>
      <p class="warning-text">{{ $t('account.deleteNotice') }}</p>
      <div class="terms-check">
        <label>
          <input type="checkbox" v-model="confirmDeleteChecked" />
          {{ $t('account.deleteAgree') }}
        </label>
      </div>
      <div class="button-row">
        <YamatoButton
          type="danger"
          :disabled="!confirmDeleteChecked"
          @click="handleDeleteAccount"
        >
          {{ $t('account.fullDelete') }}
        </YamatoButton>
        <YamatoButton @click="showDeleteModal = false">{{ $t('common.cancel') }}</YamatoButton>
      </div>
    </ModalContent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useI18n } from 'vue-i18n'

import YamatoButton from '@/components/YamatoButton.vue'
import IconButton from '@/components/IconButton.vue'
import ModalContent from '@/components/Modal.vue'
import TermsModal from '@/components/TermsModal.vue'
import PremiumModal from '@/components/PremiumModal.vue'

const showPremiumInfoModal = ref(false)
const showTermsModal = ref(false)

const router = useRouter()
const { t } = useI18n()
const userEmail = ref('')

const selectedColor = ref('#274c77')
const subscriptionStatus = ref('loading')
const confirmDeleteChecked = ref(false)

const showSignOutModal = ref(false)
const showPremiumModal = ref(false)
const showDeleteModal = ref(false)

onMounted(async () => {
  const user = await Auth.currentAuthenticatedUser()
  selectedColor.value = user.attributes['custom:iconColor'] || '#274c77'
  subscriptionStatus.value = user.attributes['custom:subscription'] || 'free'
  userEmail.value = user.attributes.email || ''
})

const subscriptionStatusDisplay = computed(() =>
  subscriptionStatus.value === 'paid' ? t('account.paid') :
  subscriptionStatus.value === 'free' ? t('account.free') : '...'
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
    alert(t('account.deleteFailed'))
  }
}

async function upgrade() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    await Auth.updateUserAttributes(user, { 'custom:subscription': 'paid' })
    subscriptionStatus.value = 'paid'
    alert(t('account.upgradeSuccess'))
  } catch (e) {
    console.error('❌ アップグレード失敗:', e)
    alert(t('account.upgradeFailed'))
  }
}

async function downgrade() {
  try {
    const user = await Auth.currentAuthenticatedUser()
    await Auth.updateUserAttributes(user, { 'custom:subscription': 'free' })
    subscriptionStatus.value = 'free'
    alert(t('account.downgradeSuccess'))
  } catch (e) {
    console.error('❌ ダウングレード失敗:', e)
    alert(t('account.downgradeFailed'))
  }
}

function goToResetPassword() {
  router.push('/forgot-password')
}

</script>


<style scoped>
/* --- スタイルはそのまま --- */
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
  text-align: center;
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

.button-row button,
.YamatoButton {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  white-space: nowrap;
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


.warning-text {
  font-size: 0.9rem;
  color: #d33;
  margin-top: 0.5rem;
  text-align: center;
}

.terms-check {
  text-align: left;
  font-size: 0.9rem;
  margin-top: 1rem;
}
.terms-check input {
  margin-right: 0.4rem;
}

.user-email {
  font-size: 0.9rem;
  color: #555;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  word-break: break-all;
}
@media (prefers-color-scheme: dark) {
  .user-email {
    color: #ccc;
  }
}


</style>
