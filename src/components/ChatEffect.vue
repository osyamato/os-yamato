<template>
  <Teleport to="body">
    <!-- 雨 -->
    <div v-if="effectType === 'rain'" class="effect-container">
      <div v-for="n in 50" :key="'rain-' + n" class="raindrop" :style="randomRainStyle()" />
    </div>

<!-- 雪 -->
<div v-if="effectType === 'snow'" class="effect-container">
  <div class="snow-overlay"></div> <!-- ← 追加！ -->
  <div v-for="n in 50" :key="'snow-' + n" class="snowflake" :style="randomSnowStyle()" />
</div>

    <!-- 晴れ -->
    <div v-if="effectType === 'sunny'" class="effect-container">
      <div v-for="n in 6" :key="'sunny-' + n" class="sunbeam" :style="randomSunnyStyle()" />
    </div>

    <!-- 風 -->
    <div v-if="effectType === 'wind'" class="effect-container">
      <div v-for="n in 30" :key="'wind-' + n" class="wind-particle" :style="randomWindStyle()" />
    </div>

    <!-- 春（桜） -->
    <div v-if="effectType === 'spring'" class="effect-container">
      <div
        v-for="n in 100"
        :key="'sakura-' + n"
        class="sakura-petal"
        :style="randomSakuraStyle(n)"
      />
    </div>

    <!-- 夏 -->
    <div v-if="effectType === 'summer'" class="effect-container">
      <div
        v-for="n in 2"
        :key="'swallow-' + n"
        class="swallow-curve"
        :style="{
          backgroundImage: 'url(/summer.png)',
          animationDelay: `${Math.random() * 1.5}s`
        }"
      />
    </div>

    <!-- 秋 -->
    <div v-if="effectType === 'autumn'" class="effect-container">
      <div
        v-for="n in 88"
        :key="'autumn-' + n"
        class="autumn-leaf"
        :style="randomAutumnStyle(n)"
      />
    </div>

    <!-- 月 -->
    <div v-if="effectType === 'moon'" class="effect-container">
      <div class="moon-overlay"></div>
      <div class="moon"></div>
    </div>

    <!-- 三島 -->
    <div v-if="effectType === 'mishima'" class="effect-container">
      <div class="mishima-overlay"></div>
      <div class="mishima-image" />
    </div>

    <!-- 土星 -->
    <div v-if="effectType === 'saturn'" class="effect-container">
      <div class="saturn-overlay"></div>
      <div class="saturn-image" />
    </div>

<!-- 星空 -->
<div v-if="effectType === 'starry'" class="effect-container starry-bg">
  <div v-for="n in 50" :key="'star-' + n" class="star" :style="randomStarStyle()" />
  <div
    v-for="n in meteorCount"
    :key="'meteor-' + n"
    class="meteor"
    :style="randomMeteorStyle()"
  />
</div>


    <!-- 紙吹雪 -->
    <div v-if="effectType === 'confetti'" class="effect-container">
      <div
        v-for="n in 100"
        :key="'confetti-' + n"
        class="confetti"
        :style="randomConfettiStyle(n)"
      />
    </div>

<!-- シャボン玉 -->
<div v-if="effectType === 'bubble'" class="effect-container">
  <div
    v-for="n in 30"
    :key="'bubble-' + n"
    class="bubble"
    :style="randomBubbleStyle()"
  />
</div>


  </Teleport>

</template>

<script setup>
import { ref } from 'vue'

const effectType = ref(null)

function triggerRain() { effectType.value = 'rain'; resetAfterDelay() }
function triggerSunny() { effectType.value = 'sunny'; resetAfterDelay() }
function triggerWind() { effectType.value = 'wind'; resetAfterDelay() }
function triggerSpring() { effectType.value = 'spring'; resetAfterDelay() }
function triggerAutumn() {
  effectType.value = 'autumn'
  resetAfterDelay(7000) // 秋の葉もゆっくり落ちる
}
function triggerMoon() { effectType.value = 'moon'; resetAfterDelay() }
function triggerSummer() {
  effectType.value = 'summer'
  resetAfterDelay(8000) // 夏のツバメ：長めに見せる
}
function triggerMishima() {
  effectType.value = 'mishima'
  resetAfterDelay()
}
function triggerSaturn() {
  effectType.value = 'saturn'
  resetAfterDelay()
}
function triggerConfetti() {
  effectType.value = 'confetti'
  resetAfterDelay()
}

function triggerSnow() {
  effectType.value = 'snow'
  resetAfterDelay(8000) // 雪は長めに残す
}

const showMeteor = ref(false) // ← 流れ星用の制御

const meteorCount = ref(0)

function triggerStarry() {
  effectType.value = 'starry'
  meteorCount.value = 0

  setTimeout(() => {
    // 🌠 1〜3個の流れ星をランダムに
meteorCount.value = Math.floor(Math.random() * 6) // ✅ 0〜5個
  }, 2000)

  resetAfterDelay()
}
function randomStarStyle() {
  const top = Math.random() * 100
  const left = Math.random() * 100
  const size = 1 + Math.random() * 2

  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${Math.random() * 2}s`
  }
}

function randomMeteorStyle() {
  const angle = Math.random() * (Math.PI / 2) - (Math.PI / 4) // -45°〜+45°
  const distance = 300 + Math.random() * 300
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance
  const top = Math.random() * 80

  return {
    top: `${top}%`,
    left: '-50px',
    width: '2px',
    height: '2px',
    background: 'white',
    borderRadius: '50%',
    opacity: 0,
    animation: `meteor-fade-move 1.5s ease-out forwards`,
    '--dx': `${dx}px`,
    '--dy': `${dy}px`
  }
}

function playEffect(type) {
  if (effectType.value === type) {
    effectType.value = null
    setTimeout(() => {
      if (type === 'starry') triggerStarry()
      else {
        effectType.value = type
        resetAfterDelay()
      }
    }, 100)
  } else {
    if (type === 'starry') triggerStarry()
    else {
      effectType.value = type
      resetAfterDelay()
    }
  }
}

function triggerBubble() {
  effectType.value = 'bubble'
  resetAfterDelay(6000)
}

function randomBubbleStyle() {
  const size = 40 + Math.random() * 40
  const left = Math.random() * 100
  const delay = Math.random() * 2
  const duration = 4 + Math.random() * 3

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

defineExpose({
  triggerRain,
  triggerSnow,
  triggerSunny,
  triggerWind,
  triggerSpring,
  triggerAutumn,
  triggerMoon,
  triggerSummer,      // ← ✅ これが抜けていた
  triggerMishima,
  triggerSaturn,
  triggerConfetti,
  triggerStarry,
　triggerBubble,
  playEffect
})

let resetTimer = null

function resetAfterDelay(duration = 6000) {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    effectType.value = null
    resetTimer = null
  }, duration)
}
function randomRainStyle() {
  const left = Math.random() * 100
  const delay = Math.random()
  const duration = 1.5 + Math.random()

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

function randomAutumnStyle(index) {
  const dx = (Math.random() - 0.5) * 200 + 'px'
  const dy = (Math.random() - 0.5) * 200 + 'px'
  const size = 24 + Math.random() * 16
  const imageIndex = (index % 2) + 1
const duration = (2.0 + Math.random() * 1.5).toFixed(2) + 's'  // ← 少し長めに
  const top = Math.random() * 80
  const left = Math.random() * 80

  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
backgroundImage: `url('/autumn${imageIndex}.png')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    animationName: 'autumn-pop',
    animationDuration: duration,
    animationTimingFunction: 'ease-out',
    animationIterationCount: '1',
    animationFillMode: 'forwards',
    '--dx': dx,
    '--dy': dy
  }
}

function curvedSwallowStyle(index) {
  const delay = Math.random() * 2
  const duration = 6 + Math.random() * 2
  const top = 10 + Math.random() * 30
  const left = -10

  return {
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    width: '64px',
    height: '64px',
    backgroundImage: `url('/summer.png')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    animationName: 'swallow-curve-flight',
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: '1',
    animationFillMode: 'forwards',
    pointerEvents: 'none',
  }
}

function randomSnowStyle() {
  const left = Math.random() * 100
  const delay = Math.random() * 2                // スタートのバラつき
  const duration = 6 + Math.random() * 3         // 💡 6〜9秒で落下（長め）
  const size = 8 + Math.random() * 8

  return {
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: 0.9
  }
}

function randomSunnyStyle() {
  const size = 120 + Math.random() * 100
  const top = 10 + Math.random() * 60
  const left = 10 + Math.random() * 60
  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
    opacity: 0.4 + Math.random() * 0.4,
    animationDelay: `${Math.random() * 2}s`
  }
}

function randomWindStyle() {
  const top = Math.random() * 100
  const delay = Math.random() * 2
  const duration = 2 + Math.random() * 2
  const size = 4 + Math.random() * 4

  return {
    top: `${top}%`,
    left: `-10px`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

function randomSakuraStyle(index) {
  const dx = (Math.random() - 0.5) * 200 + 'px'
  const dy = (Math.random() - 0.5) * 200 + 'px'
  const size = 24 + Math.random() * 16
  const imageIndex = (index % 2) + 1
  const duration = (1.1 + Math.random() * 0.5).toFixed(2) + 's'
  const top = Math.random() * 80
  const left = Math.random() * 80

  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
backgroundImage: `url('/sakura${imageIndex}.png')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    animationName: 'sakura-pop',
    animationDuration: duration,
    animationTimingFunction: 'ease-out',
    animationIterationCount: '1',
    animationFillMode: 'forwards',
    '--dx': dx,
    '--dy': dy
  }
}
function randomConfettiStyle(index) {
const pastelColors = ['#e63946', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e67e22']
  const color = pastelColors[index % pastelColors.length]

  // 360度に向けて拡散
  const angle = Math.random() * 2 * Math.PI
  const radius = Math.random() * 200 + 100 // 100〜300px程度
  const dx = Math.cos(angle) * radius + 'px'
  const dy = Math.sin(angle) * radius + 'px'

  const size = 6 + Math.random() * 6
  const duration = (1.5 + Math.random()).toFixed(2) + 's'

  return {
    top: '50%',
    left: '50%',
    width: `${size}px`,
    height: `${size * 2}px`,
    backgroundColor: color,
    animationName: 'confetti-burst',
    animationDuration: duration,
    animationTimingFunction: 'ease-out',
    animationIterationCount: '1',
    animationFillMode: 'forwards',
    '--dx': dx,
    '--dy': dy
  }
}


</script>

<style scoped>
.effect-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 999;
}

.raindrop {
  position: absolute;
  top: -30px;
  width: 12px;
  height: 18px;
  background: rgba(77, 166, 255, 0.5);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  transform: rotate(180deg);
  box-shadow: inset -1px -1px 2px rgba(255, 255, 255, 0.4);
  animation-name: fall;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  opacity: 0.6;
}

.moon,
.mishima-image,
.saturn-image {
  position: absolute;
  bottom: 300px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 180px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0;
  animation: moonRise 6s ease-out forwards;
  z-index: 6;
}

.moon { background-image: url('/moon.png.1.png'); }
.mishima-image { background-image: url('/mishima.1.png'); }
.saturn-image { background-image: url('/saturn.1.png'); }

.moon-overlay,
.mishima-overlay,
.saturn-overlay {
  position: absolute;
  top: -10%;
  left: 0;
  width: 100%;
  height: 120%;
  background-color: rgba(0, 0, 0, 0.8);
  animation: fadeOut 6s ease-out forwards;
  z-index: 0;
  will-change: opacity;
}

.sunbeam {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 223, 0, 0.4) 0%, rgba(255, 223, 0, 0) 80%);
  border-radius: 50%;
  animation: sunnyFade 8s ease-in-out forwards;
  opacity: 0;
}

.wind-particle {
  position: absolute;
  background: rgba(0, 128, 0, 0.5);
  border-radius: 50%;
  animation-name: windMove;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.sakura-petal {
  position: absolute;
  animation: sakura-pop ease-out forwards;
}

.autumn-leaf {
  position: absolute;
  animation: autumn-pop ease-out forwards;
}

.confetti {
  position: absolute;
  animation: confetti-pop ease-out forwards;
  border-radius: 2px;
}

.swallow-curve {
  position: absolute;
  top: 50%;
  left: 0;
  width: 64px;
  height: 64px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-50%);
  animation: swallow-straight-flight 2.8s ease-in-out forwards;
  z-index: 10;
}

.starry-bg {
  background: radial-gradient(ellipse at bottom, #000 0%, #000 100%);
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: twinkle 2s infinite ease-in-out;
}

.meteor {
  position: absolute;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: meteor-move 1.6s ease-out forwards;
  opacity: 0;
}

.bubble {
  position: absolute;
  bottom: -50px;
  width: 40px;
  height: 40px;
  background-image: url('/bubble.png');
  background-size: cover;
  background-repeat: no-repeat;
  animation: bubble-float 12s ease-out forwards;
  opacity: 0.7;
  pointer-events: none;
}

/* ✅ 雪の結晶 PNG 用 統一スタイル */
.snowflake {
  position: absolute;
  top: -20px;
  background-image: url('/snowflake6.png'); /* ← PNG 結晶パス */
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
  animation-name: snowfall;
  animation-timing-function: ease-in-out;
  animation-fill-mode: both;
  width: 40px;
  height: 40px;
}

.snow-overlay {
  position: absolute;
  top: -10%;
  left: 0;
  width: 100%;
  height: 120%;
  background-color: rgba(0, 0, 0, 0.7); /* ← 濃さは自由に調整 */
  animation: fadeOut 8s ease-out forwards;
  z-index: 0;
  will-change: opacity;
}


</style>

<style>
@keyframes fall {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes snowfall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes sunnyFade {
  0% { transform: scale(0.8); opacity: 0; }
  30% { transform: scale(1.05); opacity: 0.6; }
  70% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.15); opacity: 0; }
}

@keyframes windMove {
  0% { transform: translateX(0); opacity: 0.7; }
  100% { transform: translateX(-100vw); opacity: 0; }
}

@keyframes sakura-pop {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  25%  { transform: translate(var(--dx), var(--dy)) rotate(90deg); opacity: 1; }
  50%  { transform: translate(calc(var(--dx) * 1.2), calc(var(--dy) * 1.2)) rotate(180deg); opacity: 0.8; }
  75%  { transform: translate(calc(var(--dx) * 1.4), calc(var(--dy) * 1.4)) rotate(270deg); opacity: 0.4; }
  100% { transform: translate(calc(var(--dx) * 1.6), calc(var(--dy) * 1.6)) rotate(360deg); opacity: 0; }
}

@keyframes autumn-pop {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  20% { transform: translate(var(--dx), var(--dy)) rotate(90deg); opacity: 1; }
  50% { transform: translate(calc(var(--dx) * 1.2), calc(var(--dy) * 1.2)) rotate(180deg); opacity: 0.9; }
  80% { transform: translate(calc(var(--dx) * 1.4), calc(var(--dy) * 1.4)) rotate(270deg); opacity: 0.4; }
  90% { opacity: 0.2; }
  100% { transform: translate(calc(var(--dx) * 1.6), calc(var(--dy) * 1.6)) rotate(360deg); opacity: 0; }
}

@keyframes moonRise {
  0% { transform: translateX(-50%) translateY(100px); opacity: 0; }
  40% { opacity: 1; }
  100% { transform: translateX(-50%) translateY(-80px); opacity: 0; }
}

@keyframes fadeOut {
  0% { opacity: 0; }    /* 最初は透明 */
  20% { opacity: 1; }   /* 20% の時点で完全に見えるようになる */
  80% { opacity: 1; }   /* 80% までずっと見えている */
  100% { opacity: 0; }  /* 最後に再び消える */
}

@keyframes swallow-straight-flight {
  0%   { transform: translate(0, -50%) scale(0.9); opacity: 0; }
  10%  { transform: translate(5vw, -50%) scale(1); opacity: 0.8; }
  90%  { transform: translate(90vw, -50%) scale(1); opacity: 1; }
  100% { transform: translate(100vw, -50%) scale(1); opacity: 0; }
}

@keyframes confetti-burst {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(1.2) rotate(720deg); opacity: 0; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

@keyframes meteor-move {
  0% { transform: translate(0, 0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}

@keyframes bubble-float {
  0% { transform: translateY(0) translateX(0) scale(0.9) rotate(0deg); opacity: 0.8; }
  30% { transform: translateY(-400px) translateX(10px) scale(1) rotate(90deg); }
  60% { transform: translateY(-700px) translateX(-10px) scale(1.05) rotate(180deg); }
  100% { transform: translateY(-1000px) translateX(20px) scale(1.1) rotate(360deg); opacity: 0; }
}
</style>

