import * as BABYLON from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'

import { FREQUENCY } from '../config/grid'
import * as Colors from '../config/colors'
import buildVertexData from './vertex-data'

export default class WorldMesh {
  constructor(world, scene) {
    this.scene = scene
    this.world = world
    this.meshes = {}

    this.blockMaterial = new GridMaterial('voxels-material', scene)
    this.blockMaterial.mainColor = Colors.Light2
    this.blockMaterial.lineColor = Colors.Light1
    this.blockMaterial.majorUnitFrequency = FREQUENCY
  }

  fill(x, y, z, width, height, depth, value) {
    this.world.fill(x, y, z, width, height, depth, value)
  }

  render() {
    for (const index in this.world.chunks) {
      let mesh = this.meshes[index]
      const chunk = this.world.chunks[index]

      if (!chunk.dirty) continue

      if (!mesh) {
        mesh = new BABYLON.Mesh(`chunk-${index}`, this.scene)
        mesh.material = this.blockMaterial

        mesh.position.x = chunk.x
        mesh.position.z = chunk.z

        this.meshes[index] = mesh
      }

      const { vertexData } = buildVertexData(chunk)

      if (vertexData.indices.length === 0) {
        mesh.geometry && mesh.geometry.dispose()
      } else {
        vertexData.applyToMesh(mesh, true)
      }

      chunk.dirty = false
    }
  }
}
