<template>
  <div class="globe-container">
    <!-- 背景の星 -->
    <div class="starry-background" v-if="showStars">
      <div
        v-for="(style, index) in bgStars"
        :key="'bg-star-' + index"
        class="background-star"
        :style="style"
      />
    </div>

    <!-- 流れ星 -->
    <div class="shooting-stars" v-if="showStars">
      <div
        class="star"
        v-for="star in meteors"
        :key="star.id"
        :style="getMeteorStyle(star)"
      />
    </div>

    <!-- 上部ツールバー -->
<div class="globe-toolbar animate-drop" :class="{ 'no-user-color': showStars }">
  <button class="toolbar-button" @click="toggleStars">🪐</button>
  <button class="toolbar-button" @click="openSearchModal">🔍</button>
  <button class="toolbar-button" @click="openRegisterModal">🌸</button>
</div>

    <!-- 地球描画 -->
    <div ref="globeContainer" class="globe-canvas"></div>

    <!-- 登録モーダル -->
    <GlobeRegisterModal
      v-show="showRegisterModal"
      :visible="showRegisterModal"
      :initial-data="registerInitialData"
      customClass="naked"
      @close="showRegisterModal = false"
      @submit="handleRegisterSubmit"
    />
<SearchModal
  v-if="showSearchModalMounted"
  :visible="showSearchModal"
  :results="allBlossoms"
  @close="handleSearchClose"
  @select="handleSearchResult"
/>

<ProfileModal
  v-if="showProfileModal"
  :visible="showProfileModal"
  :profile="selectedProfile"
  @back="handleProfileBack"
  @request="handleProfileRequest"
/>

<YamatoUserSearchModal
  v-if="showYamatoSearchModal"
  :initialYamatoId="initialSearchId"
@close="showYamatoSearchModal = false"
/>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import GlobeRegisterModal from '@/components/GlobeRegisterModal.vue'
import SearchModal from '@/components/SearchModal.vue'
import ProfileModal from '@/components/ProfileModal.vue' // ← ⭐️ 追加
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { createBlossom, updateBlossom } from '@/graphql/mutations'
import { listBlossoms } from '@/graphql/queries'
import YamatoUserSearchModal from '@/components/YamatoUserSearchModal.vue'
import { getRandomLocationForCountry } from '@/utils/countryLocations' 

const allBlossoms = ref([])
const showRegisterModal = ref(false)
const globeContainer = ref(null)
let scene
let earth
const flowerMap = new Map()

function removeFlower(id) {
  if (flowerMap.has(id)) {
    earth.remove(flowerMap.get(id))
    flowerMap.delete(id)
  }
  if (flowerMap.has(id + '_hitbox')) {
    earth.remove(flowerMap.get(id + '_hitbox'))
    flowerMap.delete(id + '_hitbox')
  }
}

function clearAllFlowers() {
  flowerMap.forEach((mesh) => earth.remove(mesh))
  flowerMap.clear()
}

const blossoms = ref([])


const userHasBlossom = ref(false)
let currentBlossomId = null
const registerInitialData = ref(null)

const openRegisterModal = async () => {
  showRegisterModal.value = true
  try {
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub
    const result = await API.graphql(graphqlOperation(listBlossoms))
    const blossoms = result.data.listBlossoms.items
    const existing = blossoms.find(b => b.owner === sub)
    if (existing) {
      registerInitialData.value = {
        id: existing.id,
        nickname: existing.nickname ?? '',
        comment: existing.comment ?? '',
        yamatoId: existing.yamatoId ?? '',
        country: existing.country ?? '',
        hobby: existing.hobby ?? ''
      }
      userHasBlossom.value = true
      currentBlossomId = existing.id
    } else {
      registerInitialData.value = null
      userHasBlossom.value = false
      currentBlossomId = null
    }
  } catch (e) {
    console.error('❌ ユーザー情報取得失敗', e)
  }
}

const addFlower = (id, lat, lng, blossomData) => {
  const radius = 1.01
  const latRad = THREE.MathUtils.degToRad(lat)
  const lngRad = THREE.MathUtils.degToRad(lng)

  const x = radius * Math.cos(latRad) * Math.cos(-lngRad)
  const y = radius * Math.sin(latRad)
  const z = radius * Math.cos(latRad) * Math.sin(-lngRad)

  const texture = new THREE.TextureLoader().load('/flowers.2.png')

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false // ✅ 重なりの透過対策
  })

  const flower = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), material)

  // ✅ 群生感を出すためのランダムオフセット
  const offset = (Math.random() - 0.5) * 0.01
  flower.position.set(x + offset, y + offset, z + offset)

  // ✅ 透過順をランダムで調整
  flower.renderOrder = Math.floor(Math.random() * 1000)

  // ✅ カメラ方向に向ける
  flower.lookAt(new THREE.Vector3(0, 0, 0))

  // ✅ 登録
  earth.add(flower)
  flowerMap.set(id, flower)

  // ✅ クリック用のヒットボックスも同様に位置と向き調整
  const hitbox = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  hitbox.position.copy(flower.position)
  hitbox.quaternion.copy(flower.quaternion)
  hitbox.userData = { blossom: blossomData }

  earth.add(hitbox)
  flowerMap.set(id + '_hitbox', hitbox)
}

const handleRegisterSubmit = async (payload) => {
  const { lat, lng } = getRandomLocationForCountry(payload.country) // ← 差し替え

  try {
    const blossomData = {
      nickname: payload.nickname,
      comment: payload.comment,
      yamatoId: payload.yamatoId,
      country: payload.country,
      hobby: payload.hobby,
      lat,
      lng
    }

    if (userHasBlossom.value && currentBlossomId) {
      await API.graphql(graphqlOperation(updateBlossom, {
        input: {
          id: currentBlossomId,
          ...blossomData
        }
      }))
      removeFlower(currentBlossomId)
      addFlower(currentBlossomId, lat, lng, { id: currentBlossomId, ...blossomData })
    } else {
      const result = await API.graphql(graphqlOperation(createBlossom, {
        input: blossomData
      }))
      const newId = result.data.createBlossom.id
      addFlower(newId, lat, lng, { id: newId, ...blossomData })
    }

    console.log('✅ 登録完了')
  } catch (error) {
    console.error('❌ 登録失敗', error)
  }

  showRegisterModal.value = false
}

let renderer
let camera

onMounted(async () => {
  await nextTick()
  if (!globeContainer.value) return

  const width = globeContainer.value.clientWidth
  const height = globeContainer.value.clientHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(0, 0, 3)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  globeContainer.value.appendChild(renderer.domElement)

  const geometry = new THREE.SphereGeometry(1, 64, 64)
  const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg')
  const material = new THREE.MeshBasicMaterial({ map: texture })
  earth = new THREE.Mesh(geometry, material)
  scene.add(earth)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.enablePan = false
  controls.minDistance = 2
  controls.maxDistance = 6
  controls.target.set(0, 0, 0)
  controls.update()

  if (window.innerWidth < 600) {
    camera.position.z = 4
    controls.minDistance = 3
  }
  try {
    // ✅ Cognitoユーザー情報の取得
    const user = await Auth.currentAuthenticatedUser()
    const sub = user.attributes.sub
    const iconColor = user.attributes['custom:iconColor'] || '#a8dadc'

    // ✅ CSS変数に反映
    document.documentElement.style.setProperty('--userColor', iconColor)

    const result = await API.graphql(graphqlOperation(listBlossoms))
    const blossoms = result.data.listBlossoms.items

    console.log('🌸 allBlossoms:', blossoms)

    allBlossoms.value = blossoms
    clearAllFlowers()
    blossoms.forEach(b => {
      if (b.lat && b.lng && b.id) addFlower(b.id, b.lat, b.lng, b)
      if (b.owner === sub) {
        userHasBlossom.value = true
        currentBlossomId = b.id
      }
    })
  } catch (e) {
    console.error('❌ 花またはユーザー情報の取得失敗', e)
  }

  const animate = () => {
    requestAnimationFrame(animate)
    earth.rotation.y += 0.0015
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', () => {
    const width = globeContainer.value.clientWidth
    const height = globeContainer.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })
})
 
const meteors = ref([])
const bgStars = ref([])

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

onMounted(() => {
  for (let i = 0; i < 500; i++) {
    bgStars.value.push(generateBgStar())
  }
  setInterval(() => {
    const meteor = generateMeteor()
    meteors.value.push(meteor)
    setTimeout(() => {
      meteors.value = meteors.value.filter(s => s.id !== meteor.id)
    }, 2500)
  }, 1500)
})

const showStars = ref(false)
function toggleStars() {
  showStars.value = !showStars.value
}



const selectedProfile = ref(null)
const showProfileModal = ref(false)

function closeProfileModal() {
  selectedProfile.value = null
  showProfileModal.value = false
}

const showSearchModal = ref(false)
const showSearchModalMounted = ref(false)

function openSearchModal() {
  showSearchModalMounted.value = true
  nextTick(() => {
    showSearchModal.value = true
  })
}

function handleSearchClose() {
  showSearchModal.value = false
  setTimeout(() => {
    showSearchModalMounted.value = false
  }, 300) // アニメーション時間に応じて調整
}

function handleSearchResult(blossom) {
  console.log('🔍 選ばれたユーザー:', blossom)
  selectedProfile.value = blossom
  showSearchModal.value = false
  setTimeout(() => {
    showSearchModalMounted.value = false
    showProfileModal.value = true
  }, 300) // アニメーションに合わせて切り替え
}

function handleProfileBack() {
  showProfileModal.value = false
  nextTick(() => {
    showSearchModalMounted.value = true
    showSearchModal.value = true
  })
}
const showYamatoSearchModal = ref(false)
const initialSearchId = ref('')

function handleProfileRequest(yamatoId) {
  showProfileModal.value = false
  nextTick(() => {
    initialSearchId.value = yamatoId
    showYamatoSearchModal.value = true
  })
}

</script>


<style>
.globe-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: black;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.globe-toolbar {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translate(-50%, -40px); /* ← 初期位置：中央かつ上 */
  display: flex;
  gap: 1rem;
  z-index: 10;
  opacity: 0;
}

.globe-toolbar.animate-drop {
  animation: dropIn 0.5s ease forwards;
}

@keyframes dropIn {
  0% {
    transform: translate(-50%, -40px); /* ← アニメ開始位置 */
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 0);     /* ← アニメ終了位置：中央にそのまま落ちる */
    opacity: 1;
  }
}

.toolbar-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  font-size: 18px;
  background-color: var(--userColor, #a8dadc);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.globe-canvas {
  width: 100%;
  height: 100%;
  z-index: 1; /* ← 地球が前に */
  position: relative;
}


.shooting-stars {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0; /* ← 地球より下 */
  pointer-events: none;
}

.star {
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: white;
  border-radius: 50%;
  opacity: 0;
  animation: shootStar 2.5s linear forwards; /* ← 6s → 2.5s に短縮 */
}

@keyframes shootStar {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  10% {
    opacity: 1;
  }
  80% {
    opacity: 1;
    transform: translate(var(--dx), var(--dy));
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), var(--dy));
  }
}


.starry-background {
  position: absolute;
  inset: 0;
  z-index: 0; /* 🌟 一番奥に */
  pointer-events: none;
  overflow: hidden;
}

.background-star {
  position: absolute;
  width: 1px;
  height: 1px;
  background-color: white;
  opacity: 0.7; /* ← ✨ 明るく固定（0.3 → 0.7） */
  border-radius: 50%;
  animation: twinkle 2.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 1; }
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: white;
  border-radius: 50%;
  opacity: 0;
  animation: shootStar 2s ease-in forwards;
}

@keyframes shootStar {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  10% {
    opacity: 1;
  }
  80% {
    opacity: 1;
    transform: translate(var(--dx), var(--dy));
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--dx) * 1.5), calc(var(--dy) * 1.5)); /* ✨ なめらかに流して遠くへ */
  }
}

.globe-toolbar.no-user-color .toolbar-button {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important; /* ✅ ← ここを追加して枠を削除 */
  transition: background-color 0.3s ease;
}

</style>
