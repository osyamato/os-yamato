import * as THREE from 'three'

export class Ripple {
  mesh: THREE.Mesh
  opacity: number = 0.4
  scale: number = 1

  constructor(x: number, z: number) {
    const geometry = new THREE.RingGeometry(0.2, 0.25, 64)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: this.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.position.set(x, 0.01, z)
  }

  update(): boolean {
    this.scale += 0.02
    this.mesh.scale.set(this.scale, this.scale, this.scale)

    const mat = this.mesh.material as THREE.MeshBasicMaterial
    mat.opacity -= 0.008

    return mat.opacity > 0
  }
}
