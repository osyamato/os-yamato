<template>
  <div class="privacy-container">

    <!-- タイトル -->
    <h1 class="title">{{ t.title }}</h1>

    <!-- 🌐 言語ピッカー -->
    <div class="lang">
      <span class="globe">🌐</span>
      <select v-model="lang">
        <option value="ja">日本語</option>
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>

    <!-- 本文 -->
    <div class="content">
      <p>{{ t.intro }}</p>

      <h2>{{ t.s1 }}</h2>
      <ul>
        <li>{{ t.s1_1 }}</li>
        <li>{{ t.s1_2 }}</li>
        <li>{{ t.s1_3 }}</li>
      </ul>

      <h2>{{ t.s2 }}</h2>
      <ul>
        <li>{{ t.s2_1 }}</li>
        <li>{{ t.s2_2 }}</li>
      </ul>

      <h2>{{ t.s3 }}</h2>
      <p>{{ t.s3_body }}</p>

      <h2>{{ t.s4 }}</h2>
      <p>{{ t.s4_body }}</p>

      <h2>{{ t.s5 }}</h2>
      <p>{{ t.s5_body }}</p>

      <h2>{{ t.s6 }}</h2>
      <p>{{ t.s6_body }}</p>

      <!-- フッター -->
      <p class="updated">{{ t.updated }}</p>
      <p class="end">{{ t.end }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'auto' })
})

const lang = ref(localStorage.getItem('yamato-locale') || 'ja')
watch(lang, v => localStorage.setItem('yamato-locale', v))

const dict = {
  ja: {
    title: "プライバシーポリシー",
    intro: "花子の庭は、静かで穏やかな体験を大切にしています。本プライバシーポリシーは、本アプリにおける情報の取り扱いについて説明するものです。",

    s1: "第1条（取得する情報）",
    s1_1: "本アプリはユーザー登録を必要としません。",
    s1_2: "個人情報は原則として収集しません。",
    s1_3: "ゲームデータは端末内に保存されます。",

    s2: "第2条（利用目的）",
    s2_1: "機能提供および改善のためにのみ利用されます。",
    s2_2: "広告目的で個人情報を利用しません。",

    s3: "第3条（第三者提供）",
    s3_body: "法令に基づく場合を除き、第三者提供は行いません。",

    s4: "第4条（外部サービス）",
    s4_body: "本アプリはAppleのアプリ内課金を利用しています。課金情報はAppleにより管理され、開発者が直接取得することはありません。",

    s5: "第5条（データの保存）",
    s5_body: "データは通常端末内に保存されます。OS Yamatoアカウントにサインインすることで、任意でクラウドバックアップを作成できます。バックアップは常に上書き保存され、複数端末利用時には意図しない上書きが発生する可能性があります。バックアップ機能は補助的なものであり、データの完全な保全を保証するものではありません。データの消失・上書き・復元失敗について、運営は責任を負いかねます。",

    s6: "第6条（ポリシーの変更）",
    s6_body: "必要に応じて改訂され、掲載時点で効力を持ちます。",

    updated: "最終更新日：2026年3月3日",
    end: "どうか、この庭を安心してお楽しみください。"
  },

  en: {
    title: "Privacy Policy",
    intro: "hanaco Garden values a calm and gentle experience. This privacy policy explains how information is handled within the app.",

    s1: "1. Information We Collect",
    s1_1: "No user registration is required.",
    s1_2: "We do not collect personal information.",
    s1_3: "Game data is stored locally on your device.",

    s2: "2. Purpose of Use",
    s2_1: "Information is used only for providing and improving app features.",
    s2_2: "We do not use personal data for advertising.",

    s3: "3. Third-Party Sharing",
    s3_body: "We do not share information with third parties unless required by law.",

    s4: "4. External Services",
    s4_body: "This app uses Apple’s in-app purchase system. Payment data is handled by Apple and not accessed by the developer.",

    s5: "5. Data Storage",
    s5_body: "Data is normally stored locally on your device. By signing in with an OS Yamato account, you may optionally create a cloud backup. Backups overwrite previous data and using multiple devices may result in unintended overwrites. The backup feature is supplemental and does not guarantee complete data preservation. The developer is not responsible for data loss, overwriting, or restoration failures.",

    s6: "6. Policy Changes",
    s6_body: "This policy may be updated when necessary and becomes effective upon publication.",

    updated: "Last updated: March 3, 2026",
    end: "We hope you enjoy this peaceful garden."
  },

  zh: {
    title: "隐私政策",
    intro: "花子的庭院重视宁静而温和的体验。本隐私政策说明本应用中信息的处理方式。",

    s1: "第1条（收集的信息）",
    s1_1: "本应用不需要用户注册。",
    s1_2: "原则上不会收集个人信息。",
    s1_3: "游戏数据保存在您的设备本地。",

    s2: "第2条（使用目的）",
    s2_1: "信息仅用于提供和改进应用功能。",
    s2_2: "不会将个人信息用于广告目的。",

    s3: "第3条（向第三方提供）",
    s3_body: "除法律要求外，我们不会向第三方提供信息。",

    s4: "第4条（外部服务）",
    s4_body: "本应用使用 Apple 的应用内购买系统。支付信息由 Apple 管理，开发者不会直接获取这些信息。",

    s5: "第5条（数据存储）",
    s5_body: "数据通常保存在您的设备本地。登录 OS Yamato 账户后，您可以选择创建云端备份。备份会覆盖旧数据，在多设备使用时可能发生意外覆盖。备份功能仅为辅助功能，不保证数据的完整保存。对于数据丢失、覆盖或恢复失败，运营方不承担责任。",

    s6: "第6条（政策变更）",
    s6_body: "本政策可能会根据需要进行修改，并在发布后立即生效。",

    updated: "最后更新：2026年3月3日",
    end: "希望您在这个安静的庭院中度过愉快的时光。"
  }
}

const t = computed(() => dict[lang.value])
</script>

<style scoped>
.privacy-container {
  max-width: 720px;
  margin: 80px auto;
  padding: 0 24px;
  line-height: 1.9;
  font-size: 15px;
  text-align: center;
}

/* タイトル */
.title {
  font-size: 32px;
  margin-bottom: 12px;
  letter-spacing: 0.04em;
}

/* 🌐 言語ピッカー */
.lang {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 36px;
  opacity: 0.85;
}

/* ピッカー */
select {
  border: none;
  outline: none;
  box-shadow: none;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
}

/* ☀️ ライトモード */
@media (prefers-color-scheme: light) {
  select {
    background: transparent;
    color: #222;
  }
}

/* 🌙 ダークモード */
@media (prefers-color-scheme: dark) {
  select {
    background: rgba(255,255,255,0.92);
    color: #000;
  }
}

/* 本文 */
.content {
  max-width: 560px;
  margin: 0 auto;
}

/* 見出し */
.content h2 {
  margin-top: 30px;
  font-size: 18px;
}

/* リスト整形 */
.content ul {
  text-align: left;
  display: inline-block;
  padding-left: 18px;
  margin-top: 6px;
}

/* 更新日 */
.updated {
  margin-top: 60px;
  font-size: 13px;
  opacity: 0.45;
}

/* 終わり */
.end {
  margin-top: 12px;
  opacity: 0.65;
}
</style>
