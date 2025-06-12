<template>
  <div class="about-view">
    <h2>OS Yamato - ver.0</h2>

    <section>
      <h3>🌸 コンセプト</h3>
      <p>
        OS Yamato は「記録は触れられなければ風に還る」を思想とした、
        データを蓄積しすぎない、静かで控えめなOSです。
      </p>
    </section>

    <section>
      <h3>🛠️ 主な機能</h3>
      <ul>
        <li>日記：花が咲くように記録が残る</li>
        <li>カレンダー：淡い予定表示と祝日対応</li>
        <li>チャット：一時的なやりとりを美しく</li>
        <li>メモ・連絡先・風の便り：必要なことだけを軽やかに</li>
        <li>写真管理：EXIFで管理され、期限で散る</li>
      </ul>
    </section>

    <section>
      <h3>📩 お問い合わせ</h3>
      <p>開発者: 倉岡 剛</p>
      <p>Email: tsuyoshi.kuraoka@gmail.com</p>
      <p>GitHub: <a href="https://github.com/osyamato/os-yamato" target="_blank">osyamato/os-yamato</a></p>
    </section>
  </div>
</template>

<script setup>
// 必要に応じて i18n やアイコンカラーの取得など追加可能
</script>

<style scoped>
.about-view {
  padding: 2rem;
  animation: fadeIn 0.6s ease;
}

h2 {
  font-size: 1.6rem;
  margin-bottom: 1rem;
  text-align: center;
}

section {
  margin-bottom: 2rem;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

ul {
  padding-left: 1.2rem;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: var(--yamato-primary);
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
