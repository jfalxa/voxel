import * as BABYLON from '@babylonjs/core'
import Voxels from './voxels'

function updatePositions(positions, x, y, z) {
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += x + 0.5
    positions[i + 1] += y + 0.5
    positions[i + 2] += z + 0.5
  }
}

function updateIndices(indices, offset) {
  for (let i = 0; i < indices.length; i++) {
    indices[i] += offset
  }
}

/**
 * @param {Voxels} voxels
 */
function computeVertexData(voxels) {
  const vertexData = new BABYLON.VertexData()

  vertexData.positions = []
  vertexData.indices = []
  vertexData.normals = []
  vertexData.uvs = []

  for (let x = 0; x < voxels.width; x++)
    for (let y = 0; y < voxels.height; y++)
      for (let z = 0; z < voxels.depth; z++) {
        const value = voxels.get(x, y, z)

        if (value > 0) {
          const cubeData = BABYLON.VertexData.CreateBox({ size: 1 })

          updatePositions(cubeData.positions, x, y, z)
          updateIndices(cubeData.indices, vertexData.positions.length / 3)

          vertexData.positions.push(...cubeData.positions)
          vertexData.indices.push(...cubeData.indices)
          vertexData.normals.push(...cubeData.normals)
          vertexData.uvs.push(...cubeData.uvs)
        }
      }

  return vertexData
}

export default class Mesh extends BABYLON.Mesh {
  setVoxels(voxels) {
    computeVertexData(voxels).applyToMesh(this, true)
  }
}
