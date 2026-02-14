<template>
  <div class="privacy">
    <h1>プライバシーポリシー</h1>

    <p>
      花子のにわは、静かで穏やかな体験を大切にしています。
      本プライバシーポリシーは、本アプリにおける情報の取り扱いについて説明するものです。
    </p>

    <h2>第1条（取得する情報）</h2>
    <ul>
      <li>本アプリはユーザー登録を必要としません。</li>
      <li>個人情報は原則として収集しません。</li>
      <li>ゲームデータは端末内に保存されます。</li>
    </ul>

    <h2>第2条（利用目的）</h2>
    <ul>
      <li>機能提供および改善のためにのみ利用されます。</li>
      <li>広告目的で個人情報を利用しません。</li>
    </ul>

    <h2>第3条（第三者提供）</h2>
    <p>法令に基づく場合を除き、第三者提供は行いません。</p>

    <h2>第4条（外部サービス）</h2>
    <p>
      本アプリはAppleのアプリ内課金を利用しています。
      課金情報はAppleにより管理され、開発者が直接取得することはありません。
    </p>

    <h2>第5条（データの保存）</h2>
    <p>データは端末内に保存され、クラウド同期は提供していません。</p>

    <h2>第6条（ポリシーの変更）</h2>
    <p>必要に応じて改訂され、掲載時点で効力を持ちます。</p>

    <p class="end">
      どうか、この庭を安心してお楽しみください。
    </p>
  </div>
</template>

<script setup>
const today = new Date().toISOString().split("T")[0]
</script>

<style scoped>
.privacy-container {
  max-width: 720px;
  margin: 40px auto;
  padding: 24px;
  line-height: 1.8;
  font-size: 15px;
}

h1 {
  font-size: 28px;
  margin-bottom: 20px;
}

h2 {
  margin-top: 24px;
  font-size: 18px;
}

.footer {
  margin-top: 40px;
  opacity: 0.6;
  font-size: 13px;
}
</style>
