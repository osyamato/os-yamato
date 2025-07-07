<template>
  <div
    class="planet-view"
    :style="{ opacity: allTexturesLoaded ? 1 : 0, backgroundColor: 'black' }"
  >
    <!-- 2️⃣ アイコンツールバー -->
    <div class="activity-toolbar">
      <button
        class="toolbar-button"
        :style="{ backgroundColor: iconColor }"
      >🪐</button>
      <button
        class="toolbar-button"
        :style="{ backgroundColor: iconColor }"
      >🧮</button>
    </div>

    <!-- 3️⃣ Three.js 惑星 -->
    <div
      ref="container"
      style="width: 100%; height: 80vh; position: relative; background-color: black;"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
const iconColor = ref('#3b82f6') // デフォルト青

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
let labelSprite = null

onMounted(async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    iconColor.value = user.attributes['custom:iconColor'] || '#3b82f6'
  } catch (e) {
    console.error('❌ ユーザー情報取得失敗', e)
  }

  const counts = await fetchAllCounts()
  console.log("✅ Counts fetched:", counts)

  textureUrls.forEach((url) => {
    loader.load(
      url,
      (texture) => {
        loadedTextures[url] = texture
        texturesLoadedCount++
        if (texturesLoadedCount === textureUrls.length) {
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
})

function getFlowerColor(count) {
  if (count < 10) return new THREE.Color(0x2563eb)
  else if (count < 20) return new THREE.Color(0x7c3aed)
  else if (count < 30) return new THREE.Color(0xfacc15)
  else if (count < 40) return new THREE.Color(0xf97316)
  else return new THREE.Color(0xef4444)
}

function createLabelSprite(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024   // 高解像度
  canvas.height = 256
  const context = canvas.getContext('2d')

  // 背景をクリア
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'white'
  context.font = 'bold 100px "Noto Sans JP", sans-serif' // 少し小さめ
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)

  // 🌱 ここでスケールを小さく（全体的にコンパクトに）
  sprite.scale.set(3, 0.75, 1) // ← 必要に応じてさらに調整可

  return sprite
}

function initScene(counts) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

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

  const flowerTexture = loadedTextures['/dialy.1.png']

  const planetInfo = [
    { texture: '/moon.jpg', text: t('activity.photo'), count: counts.photos },
    { texture: '/venus.jpg', text: t('activity.video'), count: counts.videos },
    { texture: 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg', text: t('activity.message'), count: counts.chatRooms },
    { texture: '/jupiter.jpg', text: t('activity.memo'), count: counts.memos },
    { texture: '/mars.jpg', text: t('activity.contact'), count: counts.contacts }
  ]

  planetInfo.forEach((info) => {
    const texture = loadedTextures[info.texture]
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.3,
      roughness: 0.5
    })
    const geometry = new THREE.SphereGeometry(2, 64, 64)
    const mesh = new THREE.Mesh(geometry, material)

    mesh.userData = { info }
    mesh.name = info.text

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

    const color = getFlowerColor(count)

    for (let i = 0; i < count; i++) {
      const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5)
      const material = new THREE.MeshBasicMaterial({
        map: flowerTexture,
        color: color,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
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

    // ✅ 上段のときのみラベルを追加
    if (selectedPlanet.value.position.y >= 0) {
      labelSprite = createLabelSprite(selectedPlanet.value.userData.info.text)
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
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.planet-view {
  padding: 24px;
  background-color: #000000;
  color: #ffffff;
  font-family: 'Noto Sans JP', sans-serif;
}


.activity-toolbar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
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
</style>
