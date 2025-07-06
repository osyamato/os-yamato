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

const container = ref(null)
const planets = ref([])
const selectedPlanet = ref(null)
const selectedLabel = ref(null)

onMounted(() => {
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

  const planetInfo = [
    { texture: '/moon.jpg', text: '写真' },
    { texture: '/venus.jpg', text: '動画' },
    { texture: 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg', text: 'メッセージ' },
    { texture: '/jupiter.jpg', text: 'メモ' },
    { texture: '/mars.jpg', text: '連絡先' }
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
        selectedPlanet.value = clickedPlanet
        updatePlanetPositions()
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
selectedPlanet.value.scale.set(2.7, 2.7, 2.7)
    const gap = 5
    const startX = -((otherPlanets.length - 1) * gap) / 2

    otherPlanets.forEach((p, i) => {
      p.position.x = startX + i * gap
      p.position.y = -7
      p.scale.set(0.8, 0.8, 0.8)
    })
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

