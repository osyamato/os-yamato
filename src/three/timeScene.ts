import * as THREE from 'three'

export function initTimeScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.set(0, 5, 0)
  camera.lookAt(0, 0, 0)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 10, 7)
  scene.add(light)

  const hour = new Date().getHours()
  scene.background = new THREE.Color(hour < 6 || hour >= 18 ? '#001d2f' : '#a6e1fa')

  // テクスチャ読み込み
  const textureLoader = new THREE.TextureLoader()
  const medakaTexture = textureLoader.load('/textures/medaka1_full.png')
  const rippleTexture = textureLoader.load('/textures/ripple.png')
  const plantTexture = textureLoader.load('/textures/plant.png')

  // 🐟 メダカ
  const fish = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: medakaTexture, transparent: true })
  )
  fish.scale.set(0.5, 0.25, 1)
  fish.position.set(0, 0.2, 0)
  scene.add(fish)

  // 🌿 水草
  const plants: THREE.Sprite[] = []
  const positions = [-0.8, 0.8]
  positions.forEach((x, i) => {
    const material = new THREE.SpriteMaterial({
      map: plantTexture,
      transparent: true,
      depthWrite: false
    })
    const sprite = new THREE.Sprite(material)
    sprite.position.set(x, 0.01, 1.2)
    sprite.scale.set(1.0, 1.6, 1)
    scene.add(sprite)
    plants.push(sprite)
  })

  // 💧 波紋
  const ripples: THREE.Sprite[] = []

  function createRipple(x: number, z: number) {
    const material = new THREE.SpriteMaterial({
      map: rippleTexture,
      color: new THREE.Color(0xaaddff),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    const sprite = new THREE.Sprite(material)
    sprite.position.set(x, 0.02, z)
    sprite.scale.set(0.1, 0.1, 1)
    scene.add(sprite)
    ripples.push(sprite)

    let scale = 0.1
    const fade = setInterval(() => {
      scale += 0.015
      sprite.scale.set(scale, scale, 1)
      material.opacity -= 0.005
      if (material.opacity <= 0) {
        scene.remove(sprite)
        ripples.splice(ripples.indexOf(sprite), 1)
        clearInterval(fade)
      }
    }, 16)
  }

  // 🖱️ 波紋クリックイベント
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const point = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, point)
    createRipple(point.x, point.z)
  })

  // 🧠 ランダム方向 & ゆらぎ
  let angle = Math.random() * Math.PI * 2
  const baseSpeed = 0.015
  let directionChangeCooldown = 0
  const clock = new THREE.Clock()

  function animate() {
    requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    // 🐟 メダカ：上下ゆらぎ＋方向移動
    fish.position.y = 0.2 + Math.sin(t * 2) * 0.05
    fish.position.x += Math.cos(angle) * baseSpeed
    fish.position.z += Math.sin(angle) * baseSpeed
    fish.material.rotation = -angle

    // ⏱️ ときどき方向転換
    if (directionChangeCooldown <= 0 && Math.random() < 0.01) {
      angle += (Math.random() - 0.5) * Math.PI / 2
      directionChangeCooldown = 100
    } else {
      directionChangeCooldown--
    }

    // ⛔ 範囲超過時の反転
    const limit = 2
    if (fish.position.x > limit || fish.position.x < -limit || fish.position.z > limit || fish.position.z < -limit) {
      angle += Math.PI
    }

    // 🌿 水草の揺らぎ
    plants.forEach((sprite, i) => {
      const sway = 1 + 0.05 * Math.sin(t * 1.5 + i * Math.PI)
      sprite.scale.x = 0.8 * sway
    })

    renderer.render(scene, camera)
  }

  animate()
}
