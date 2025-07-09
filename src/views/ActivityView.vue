<template>
  <div class="planet-view" :style="{ opacity: allTexturesLoaded ? 1 : 0, backgroundColor: 'black' }">

    <!-- 宇宙背景 -->
    <div class="starry-background" v-if="showStars">
      <div
        v-for="(style, index) in bgStars"
        :key="'bg-star-' + index"
        class="background-star"
        :style="style"
      />
    </div>

    <div class="shooting-stars" v-if="showStars">
      <div
        class="star"
        v-for="star in meteors"
        :key="star.id"
        :style="getMeteorStyle(star)"
      />
    </div>

    <!-- ツールバー -->
<Transition name="toolbar-fade">
  <div v-if="showToolbar" class="activity-toolbar absolute-toolbar">
    <button class="toolbar-button" :style="{ backgroundColor: showStars ? 'transparent' : iconColor }" @click="toggleStars">🪐</button>
    <button class="toolbar-button" :style="{ backgroundColor: showStars ? 'transparent' : iconColor }" @click="toggleShowCount">🔢</button>
  </div>
</Transition>

    <!-- ピッカー -->
    <div class="picker-container">
      <button
        v-for="option in pickerOptions"
        :key="option.key"
        class="picker-button"
        :class="{ active: selectedPlanetKey === option.key }"
        @click="() => { selectedPlanetKey = option.key; changePlanet() }"
      >
        <img :src="option.img" :alt="option.label" class="picker-icon" />
      </button>
    </div>

    <!-- Three.js 惑星 -->
    <div ref="container" style="width: 100%; height: 80vh; position: relative;"></div>

    <div v-if="showCount" class="count-overlay">
      <span class="count-label">{{ currentLabel }} : {{ currentCount }}</span>
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Auth } from 'aws-amplify'
import { fetchAllCounts } from '@/utils/fetchAllCounts'
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const container = ref(null)
const allTexturesLoaded = ref(false)
const iconColor = ref('#3b82f6')
const showCount = ref(false)
const showStars = ref(false)
const bgStars = ref([])
const meteors = ref([])
const showToolbar = ref(false)

const selectedPlanetKey = ref('message')
const textures = {}
let counts = {}

let scene, camera, renderer, planetMesh, controls
const loader = new THREE.TextureLoader()
let meteorInterval = null
let flowerTexture = null
const flowerMeshes = []

const planetTextureMap = {
  photo: '/moon.jpg',
  video: '/venus.jpg',
  message: 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg',
  memo: '/jupiter.jpg',
  contact: '/mars.jpg'
}

const colorThresholds = [
  { limit: 9, color: new THREE.Color(0x2563eb) },
  { limit: 10, color: new THREE.Color(0x7c3aed) },
  { limit: 10, color: new THREE.Color(0xfacc15) },
  { limit: 10, color: new THREE.Color(0xf97316) },
  { limit: Infinity, color: new THREE.Color(0xef4444) }
]

const currentLabel = computed(() => {
  const found = pickerOptions.find(opt => opt.key === selectedPlanetKey.value)
  return found ? found.label : ''
})

const currentCount = computed(() => {
  let key = selectedPlanetKey.value
  if (key === 'message') key = 'chatRooms'
  if (key === 'memo') key = 'memos'
  if (key === 'contact') key = 'contacts'
  if (key === 'photo') key = 'photos'
  if (key === 'video') key = 'videos'
  return counts[key] || 0
})

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#3b82f6'
  } catch (e) {
    console.error('❌ ユーザー情報取得失敗', e)
  }

  counts = await fetchAllCounts()

  for (const [key, url] of Object.entries(planetTextureMap)) {
    textures[key] = await new Promise((resolve) => loader.load(url, resolve))
  }

  flowerTexture = await new Promise((resolve) => loader.load('/dialy.1.png', resolve))
  allTexturesLoaded.value = true

  initScene()
  document.body.style.overflow = 'hidden'

  for (let i = 0; i < 400; i++) {
    bgStars.value.push(generateBgStar())
  }

  meteorInterval = setInterval(() => {
    const meteor = generateMeteor()
    meteors.value.push(meteor)
    setTimeout(() => {
      meteors.value = meteors.value.filter(s => s.id !== meteor.id)
    }, 2500)
  }, 1500)

  // 🌟 Toolbar を遅延表示
  setTimeout(() => {
    showToolbar.value = true
  }, 100) 
})

const pickerOptions = [
  { key: 'photo', img: '/photo.icon.png', label: t('activity.photo') },
  { key: 'video', img: '/video.png', label: t('activity.video') },
  { key: 'message', img: '/messege.icon.activity.png', label: t('activity.message') },
  { key: 'memo', img: '/memo.icon.activity.png', label: t('activity.memo') },
  { key: 'contact', img: '/contact.icon.png', label: t('activity.contact') },
]

onUnmounted(() => {
  document.body.style.overflow = ''
  if (renderer && container.value?.firstChild) {
    container.value.removeChild(container.value.firstChild)
  }
  if (renderer) renderer.dispose()
  if (planetMesh?.geometry) planetMesh.geometry.dispose()
  if (planetMesh?.material) planetMesh.material.dispose()
  if (controls) controls.dispose()
  if (meteorInterval) clearInterval(meteorInterval)
})

function initScene() {
  scene = new THREE.Scene()

  // カメラ
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.8), 0.1, 1000)
  camera.position.z = 6  // 初期距離（近すぎず遠すぎず）

  // ライト
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 5, 5)
  scene.add(dirLight)

  // レンダラー
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight * 0.8)
  container.value.appendChild(renderer.domElement)

  // OrbitControls 設定
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.enablePan = false
  controls.minDistance = 2
  controls.maxDistance = 10
  controls.target.set(0, 0.5, 0)
  controls.update()

  // 惑星生成
  createPlanet()

  function animate() {
    requestAnimationFrame(animate)
    // 自動回転を入れたい場合はここで
    if (planetMesh) {
      planetMesh.rotation.y += 0.001
    }
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // リサイズ対応
  window.addEventListener('resize', resizeHandler)
}

function createPlanet() {
  if (planetMesh) {
    scene.remove(planetMesh)
    if (planetMesh.geometry) planetMesh.geometry.dispose()
    if (planetMesh.material) planetMesh.material.dispose()
  }
  clearFlowers()

  const texture = textures[selectedPlanetKey.value]
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

  // 💡 球を小さめに
  const geometry = new THREE.SphereGeometry(1.0, 192, 192)
  const material = new THREE.MeshBasicMaterial({ map: texture })

  planetMesh = new THREE.Mesh(geometry, material)

  // ⭐ GlobeView と同じく、位置を上げない
  planetMesh.position.y = 0

  scene.add(planetMesh)

  // 🔥 カメラ設定も合わせる
  camera.position.z = 3
  controls.minDistance = 2
  controls.maxDistance = 5
  controls.target.set(0, 0, 0)
  controls.update()

  let key = selectedPlanetKey.value
  if (key === 'message') key = 'chatRooms'
  if (key === 'memo') key = 'memos'
  if (key === 'contact') key = 'contacts'
  if (key === 'photo') key = 'photos'
  if (key === 'video') key = 'videos'

  const count = counts[key] || 0
  createFlowers(count)
}

function clearFlowers() {
  flowerMeshes.forEach(flower => {
    if (planetMesh) planetMesh.remove(flower)
    if (flower.geometry) flower.geometry.dispose()
    if (flower.material) flower.material.dispose()
  })
  flowerMeshes.length = 0
}

function createFlowers(count) {
  if (!planetMesh || !flowerTexture) return

  clearFlowers()

  let remaining = Math.min(count, 30)
  for (const group of colorThresholds) {
    if (remaining <= 0) break
    const numThisColor = Math.min(remaining, group.limit)

    for (let i = 0; i < numThisColor; i++) {
      const geometry = new THREE.PlaneGeometry(0.25, 0.25)
      const material = new THREE.MeshBasicMaterial({
        map: flowerTexture,
        color: group.color,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      })
      const flower = new THREE.Mesh(geometry, material)

      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      const radius = 1.0 + 0.03

      // ⭐ ここでは Y 補正しない
      flower.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      )
      // ⭐ ここも惑星中心に向けるだけ
      flower.lookAt(new THREE.Vector3(0, 0, 0))

      // ⭐ 惑星に追加 → 惑星自体の position.y が適用される
      planetMesh.add(flower)
      flowerMeshes.push(flower)
    }

    remaining -= numThisColor
  }
}

function changePlanet() {
  createPlanet()
}

function resizeHandler() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8)
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8)
  }
}

function toggleShowCount() {
  showCount.value = !showCount.value
}

function toggleStars() {
  showStars.value = !showStars.value
}

function generateMeteor() {
  return {
    id: Date.now() + Math.random(),
    top: Math.random() * 100,
    left: Math.random() * 100,
    dx: (Math.random() - 0.5) * 600,
    dy: (Math.random() - 0.5) * 600,
    delay: Math.random() * 1.5
  }
}

function getMeteorStyle(star) {
  return {
    top: `${star.top}%`,
    left: `${star.left}%`,
    '--dx': `${star.dx}px`,
    '--dy': `${star.dy}px`,
    animationDelay: `${star.delay}s`
  }
}

function generateBgStar() {
  return {
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 2 + 0.8}px`,
    height: `${Math.random() * 2 + 0.8}px`,
    opacity: Math.random() * 0.4 + 0.6,
    backgroundColor: ['white', '#e0f7ff', '#d0e0ff'][Math.floor(Math.random() * 3)],
    position: 'absolute',
    borderRadius: '50%',
    animation: `twinkle ${Math.random() * 1.5 + 2.5}s ease-in-out infinite`
  }
}
</script>

<style>

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.planet-view {
  padding: 24px;
  background-color: #000;
  color: #fff;
  font-family: 'Noto Sans JP', sans-serif;
  touch-action: none;
}

.activity-toolbar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  /* margin は削除します！ */
}

.absolute-toolbar {
  position: absolute;
  top: 16px;
  left: 50%;
  translate: -50% 0;
  z-index: 10;
}

.toolbar-button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  font-size: 20px;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.toolbar-button:hover {
  transform: scale(1.1);
}

.picker-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 1.5rem 0 1rem 0;
}

.starry-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.background-star {
  position: absolute;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 1; }
}

.shooting-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.star {
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: white;
  border-radius: 50%;
  opacity: 0;
  animation: shootStar 2.5s linear forwards;
}

@keyframes shootStar {
  0% { opacity: 0; transform: translate(0, 0); }
  10% { opacity: 1; }
  80% { opacity: 1; transform: translate(var(--dx), var(--dy)); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)); }
}

.picker-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 4rem 0 1rem 0;
}

.picker-button {
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 6px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.picker-button.active {
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
}

.picker-button:hover {
  transform: scale(1.1);
}

.picker-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.count-overlay {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 1.3rem;
  font-family: 'Helvetica Neue', 'Segoe UI', 'Roboto', sans-serif;
  letter-spacing: 0.5px;
  font-weight: 500;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.count-label {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  padding: 6px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  transition: all 0.3s ease;
  white-space: nowrap; /* 👈 追加 */
}

.toolbar-fade-enter-active,
.toolbar-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.toolbar-fade-enter-from,
.toolbar-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toolbar-fade-enter-to,
.toolbar-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

</style>

