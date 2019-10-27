import * as BABYLON from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'

import buildVertexData from './vertex-data'

export default class WorldMesh extends BABYLON.Mesh {
  constructor(scene) {
    super('world', scene)

    this.isPickable = false
    this.chunks = {}

    this.initChunkMaterial()
  }

  initChunkMaterial() {
    const material = new GridMaterial('chunk-material', this.scene)

    material.mainColor = new BABYLON.Color3(220 / 255, 220 / 255, 220 / 255)
    material.lineColor = new BABYLON.Color3(240 / 255, 248 / 255, 255 / 255)
    material.majorUnitFrequency = 5

    this.chunkMaterial = material
  }

  initChunkMesh(index, chunk) {
    if (this.chunks[index]) return

    const mesh = new BABYLON.Mesh(`chunk-${index}`, this.scene)
    mesh.parent = this.mesh
    mesh.material = this.chunkMaterial

    mesh.position.x = chunk.x
    mesh.position.z = chunk.z

    this.chunks[index] = mesh
  }

  renderChunkMesh(index, chunk) {
    const mesh = this.chunks[index]

    const data = buildVertexData(chunk)
    const vertexData = data.vertexData

    chunk.dirty = false

    if (vertexData.indices.length > 0) {
      vertexData.applyToMesh(mesh, true)
    } else if (mesh.geometry) {
      mesh.geometry.dispose()
    }
  }

  renderVoxels(data) {
    for (const index in data.chunks) {
      const chunk = data.chunks[index]

      if (!chunk.dirty) continue

      this.initChunkMesh(index, chunk)
      this.renderChunkMesh(index, chunk)
    }
  }
}
