<template>
  <div class="planet-view">
    <h2>アクティビティ</h2>

    <div ref="container" style="width: 100%; height: 80vh; position: relative;"></div>

    <div
      v-if="selectedLabel"
      class="label"
      :style="{ left: selectedLabel.x + 'px', top: selectedLabel.y + 'px', fontSize: '1.4rem' }"
    >
      {{ selectedLabel.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { fetchAllCounts } from '@/utils/fetchAllCounts'

const container = ref(null)
const planets = ref([])
const selectedPlanet = ref(null)
const selectedLabel = ref(null)
const flowers = ref([])

onMounted(async () => {
  const counts = await fetchAllCounts()
  console.log("✅ Counts fetched:", counts)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.8), 0.1, 1000)
  camera.position.z = 20

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight * 0.8)
  container.value.appendChild(renderer.domElement)

  const light = new THREE.AmbientLight(0xffffff, 1)
  scene.add(light)

  const loader = new THREE.TextureLoader()
  const flowerTexture = loader.load('/dialy.1.png')

  const planetInfo = [
    { texture: '/moon.jpg', text: '写真', count: counts.photos },
    { texture: '/venus.jpg', text: '動画', count: counts.videos },
    { texture: 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg', text: 'メッセージ', count: counts.chatRooms },
    { texture: '/jupiter.jpg', text: 'メモ', count: counts.memos },
    { texture: '/mars.jpg', text: '連絡先', count: counts.contacts }
  ]

  planetInfo.forEach((info) => {
    const texture = loader.load(info.texture)
    const material = new THREE.MeshStandardMaterial({ map: texture })
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
    // すべての惑星から花を削除
    planets.value.forEach(planet => {
      flowers.value.forEach(f => planet.remove(f))
    })
    flowers.value = []
  }

  function createFlowers(count) {
    clearFlowers()

    if (selectedPlanet.value.position.y < 0) {
      console.log("🚫 下段なので花は描写しません")
      return
    }

    console.log("🌼 Creating flowers for:", selectedPlanet.value.name, "Count:", count)
    for (let i = 0; i < count; i++) {
      const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5)
      const material = new THREE.MeshBasicMaterial({
        map: flowerTexture,
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
    let otherPlanets = planets.value.filter(p => p !== selectedPlanet.value)

    const isSmallScreen = window.innerHeight < 700
    selectedPlanet.value.position.x = 0
    selectedPlanet.value.position.y = isSmallScreen ? 1 : 4
    selectedPlanet.value.scale.set(3.5, 3.5, 3.5)

    const gap = 5
    const startX = -((otherPlanets.length - 1) * gap) / 2

    otherPlanets.forEach((p, i) => {
      p.position.x = startX + i * gap
      p.position.y = -7
      p.scale.set(0.8, 0.8, 0.8)
    })

    const count = selectedPlanet.value.userData.info.count || 3
    createFlowers(count)
  }

  function updateLabel() {
    const p = selectedPlanet.value
    const vector = new THREE.Vector3()
    p.getWorldPosition(vector)
    vector.project(camera)

    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth
    const offset = 100
    const y = (-vector.y * 0.5 + 0.5) * renderer.domElement.clientHeight - offset

    selectedLabel.value = {
      x,
      y,
      text: p.userData.info.text
    }
  }

  function animate() {
    requestAnimationFrame(animate)
    planets.value.forEach(p => p.rotation.y += 0.0008)
    renderer.render(scene, camera)
    updateLabel()
  }

  animate()

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8)
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8)
    updatePlanetPositions()
  })
})
</script>

<style scoped>
.planet-view {
  padding: 24px;
  background-color: #000000;
  color: #ffffff;
  font-family: 'Noto Sans JP', sans-serif;
}
h2 {
  text-align: center;
  margin-top: 0;
  font-size: 1.5rem;
  font-weight: normal;
}
.label {
  position: absolute;
  transform: translate(-50%, -100%);
  color: white;
  font-weight: bold;
  pointer-events: none;
  white-space: nowrap;
  transition: font-size 0.3s ease, top 0.3s ease;
}
</style>
