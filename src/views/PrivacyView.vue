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
    s5_body: "データは端末内に保存されます。将来的にバックアップ機能の提供を予定していますが、現時点では実装されていません。",

    s6: "第6条（ポリシーの変更）",
    s6_body: "必要に応じて改訂され、掲載時点で効力を持ちます。",

    updated: "最終更新日：2026年2月15日",
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
    s5_body: "All data is stored locally on your device. A backup feature is planned for the future but is not currently implemented.",

    s6: "6. Policy Changes",
    s6_body: "This policy may be updated when necessary and becomes effective upon publication.",

    updated: "Last updated: February 15, 2026",
    end: "We hope you enjoy this peaceful garden."
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
