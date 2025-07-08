<template>
  <div
    class="planet-view"
    :style="{ opacity: allTexturesLoaded ? 1 : 0, backgroundColor: 'black' }"
  >
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

    <!-- アイコンツールバー -->
    <div class="activity-toolbar">
      <button
        class="toolbar-button"
        :style="{ backgroundColor: showStars ? 'transparent' : iconColor }"
        @click="toggleStars"
      >🪐</button>
      <button
        class="toolbar-button"
        :style="{ backgroundColor: showStars ? 'transparent' : iconColor }"
        @click="toggleShowCount"
      >🔢</button>
    </div>

    <!-- Three.js 惑星 -->
    <div
      ref="container"
      style="width: 100%; height: 80vh; position: relative;"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { Auth } from 'aws-amplify'
import { fetchAllCounts } from '@/utils/fetchAllCounts'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const container = ref(null)
const planets = ref([])
const selectedPlanet = ref(null)
const flowers = ref([])
const allTexturesLoaded = ref(false)
const iconColor = ref('#3b82f6')
const showCount = ref(false)
const showStars = ref(false)
const bgStars = ref([])
const meteors = ref([])
let flowerTexture = null
let labelSprite = null

const loader = new THREE.TextureLoader()
const textureUrls = [
  '/moon.jpg',
  '/venus.jpg',
  'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg',
  '/jupiter.jpg',
  '/mars.jpg',
  '/dialy.1.png'
]

const loadedTextures = {}
let texturesLoadedCount = 0

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#3b82f6'
  } catch (e) {
    console.error('❌ ユーザー情報取得失敗', e)
  }

  const counts = await fetchAllCounts()
  textureUrls.forEach((url) => {
    loader.load(
      url,
      (texture) => {
        loadedTextures[url] = texture
        texturesLoadedCount++
        if (texturesLoadedCount === textureUrls.length) {
          flowerTexture = loadedTextures['/dialy.1.png']
          allTexturesLoaded.value = true
          initScene(counts)
        }
      },
      undefined,
      (error) => {
        console.error("❌ Texture load failed:", url, error)
      }
    )
  })

  // 🌟 スクロール禁止
  document.body.style.overflow = 'hidden'

  for (let i = 0; i < 400; i++) {
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

onUnmounted(() => {
  // 🌟 スクロール元に戻す
  document.body.style.overflow = ''
})

function createLabelSprite(text, count = null) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'white'
  context.font = 'bold 100px Roboto, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  let displayText = text
  if (showCount.value && count !== null) {
    displayText += `：${count}`
  }
  context.fillText(displayText, canvas.width / 2, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(3, 0.75, 1)
  return sprite
}

function initScene(counts) {
  const scene = new THREE.Scene()
  scene.background = null

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.8), 0.1, 1000)
  camera.position.z = 20

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight * 0.8)
  container.value.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)

  const planetInfo = [
    { texture: '/moon.jpg', text: t('activity.photo'), count: counts.photos },
    { texture: '/venus.jpg', text: t('activity.video'), count: counts.videos },
    { texture: 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg', text: t('activity.message'), count: counts.chatRooms },
    { texture: '/jupiter.jpg', text: t('activity.memo'), count: counts.memos },
    { texture: '/mars.jpg', text: t('activity.contact'), count: counts.contacts }
  ]

  planetInfo.forEach((info) => {
    const texture = loadedTextures[info.texture]
    const material = new THREE.MeshStandardMaterial({ map: texture, metalness: 0, roughness: 0.8 })
    const geometry = new THREE.SphereGeometry(2, 64, 64)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { info }
    scene.add(mesh)
    planets.value.push(mesh)
  })

  selectedPlanet.value = planets.value[2]
  updatePlanetPositions()

  function clearFlowers() {
    planets.value.forEach(planet => {
      flowers.value.forEach(f => planet.remove(f))
    })
    flowers.value = []
  }

  function createFlowers(count) {
    clearFlowers()
    if (selectedPlanet.value.position.y < 0) return

    const colorThresholds = [
      { limit: 9, color: new THREE.Color(0x2563eb) },
      { limit: 10, color: new THREE.Color(0x7c3aed) },
      { limit: 10, color: new THREE.Color(0xfacc15) },
      { limit: 10, color: new THREE.Color(0xf97316) },
      { limit: Infinity, color: new THREE.Color(0xef4444) }
    ]

    let remaining = count
    for (const group of colorThresholds) {
      if (remaining <= 0) break
      const numThisColor = Math.min(remaining, group.limit)
      for (let i = 0; i < numThisColor; i++) {
        const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5)
const material = new THREE.MeshStandardMaterial({
  map: flowerTexture,
  color: group.color,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  roughness: 0.6, // ← しっとり感を演出
  metalness: 0    // ← 花には金属感なし
})
        const flower = new THREE.Mesh(planeGeometry, material)
        const phi = Math.acos(2 * Math.random() - 1)
        const theta = 2 * Math.PI * Math.random()
        const radius = 2.01
        flower.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        )
        flower.lookAt(new THREE.Vector3(0, 0, 0))
        selectedPlanet.value.add(flower)
        flowers.value.push(flower)
      }
      remaining -= numThisColor
    }
  }

  function handleInteraction(event) {
    const rect = renderer.domElement.getBoundingClientRect()
    let x, y
    if (event.type === 'touchstart') {
      x = event.touches[0].clientX
      y = event.touches[0].clientY
    } else {
      x = event.clientX
      y = event.clientY
    }

    const mouse = new THREE.Vector2(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(planets.value, false)
    if (intersects.length > 0) {
      const clickedPlanet = intersects[0].object
      if (clickedPlanet !== selectedPlanet.value) {
        if (labelSprite) {
          selectedPlanet.value.remove(labelSprite)
          labelSprite = null
        }
        clearFlowers()
        selectedPlanet.value = clickedPlanet
        updatePlanetPositions()
        const count = clickedPlanet.userData.info.count || 3
        createFlowers(count)
      }
    }
  }

  window.addEventListener('click', handleInteraction)
  window.addEventListener('touchstart', handleInteraction)

  function updatePlanetPositions() {
    if (labelSprite) {
      selectedPlanet.value.remove(labelSprite)
      labelSprite = null
    }

    let otherPlanets = planets.value.filter(p => p !== selectedPlanet.value)
    const isSmallScreen = window.innerHeight < 700
    selectedPlanet.value.position.x = 0
    selectedPlanet.value.position.y = isSmallScreen ? 1 : 4
    selectedPlanet.value.scale.set(3.5, 3.5, 3.5)

    const gap = 5
    const startX = -((otherPlanets.length - 1) * gap) / 2
    otherPlanets.forEach((p, i) => {
      p.position.x = startX + i * gap
      p.position.y = -10
      p.scale.set(0.8, 0.8, 0.8)
    })

    const count = selectedPlanet.value.userData.info.count || 3
    createFlowers(count)

    if (selectedPlanet.value.position.y >= 0) {
      labelSprite = createLabelSprite(selectedPlanet.value.userData.info.text, count)
      labelSprite.position.set(0, 3, 0)
      selectedPlanet.value.add(labelSprite)
    }
  }

  function animate() {
    requestAnimationFrame(animate)
    planets.value.forEach(p => p.rotation.y += 0.0008)
    renderer.render(scene, camera)
  }

  animate()

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8)
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8)
    updatePlanetPositions()
  })
}

function toggleShowCount() {
  showCount.value = !showCount.value
  if (labelSprite) {
    selectedPlanet.value.remove(labelSprite)
    labelSprite = null
  }
  if (selectedPlanet.value.position.y >= 0) {
    const count = selectedPlanet.value.userData.info.count || 3
    labelSprite = createLabelSprite(selectedPlanet.value.userData.info.text, count)
    labelSprite.position.set(0, 3, 0)
    selectedPlanet.value.add(labelSprite)
  }
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
  touch-action: none; /* ← これ追加！！ */
}
.activity-toolbar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0.5rem 0 1rem 0; /* ← ここで上側の余白を調整 */
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
</style>
