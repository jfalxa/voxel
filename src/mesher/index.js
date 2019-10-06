import * as BABYLON from '@babylonjs/core'
import simplify from './greedy'

const INDICES = [0, 1, 2, 2, 3, 0]

function computeIndices(offset) {
  const indices = Array(INDICES.length)

  for (let i = 0; i < INDICES.length; i++) {
    indices[i] = INDICES[i] + offset
  }

  return indices
}

function groupByType(triangles) {
  const types = {}

  for (let i = 0; i < triangles.length; i++) {
    const data = triangles[i]

    const positions = data[0]
    const uvs = data[1]
    const type = data[2]

    if (!types[type]) {
      types[type] = {
        positions: [],
        indices: [],
        uvs: []
      }
    }

    const indices = computeIndices(types[type].positions.length / 3)

    types[type].positions.push(...positions)
    types[type].indices.push(...indices)
    types[type].uvs.push(...uvs)
  }

  return types
}

export default function buildVertexData(voxels) {
  const vertexData = new BABYLON.VertexData()
  const subMeshes = {}

  vertexData.positions = []
  vertexData.indices = []
  vertexData.normals = []
  vertexData.uvs = []

  const triangles = simplify(voxels)
  const types = groupByType(triangles)

  for (const type in types) {
    const positions = types[type].positions
    const indices = types[type].indices
    const uvs = types[type].uvs

    subMeshes[type] = [vertexData.indices.length, indices.length]

    vertexData.positions.push(...positions)
    vertexData.indices.push(...indices)
    vertexData.uvs.push(...uvs)
  }

  BABYLON.VertexData.ComputeNormals(
    vertexData.positions,
    vertexData.indices,
    vertexData.normals
  )

  return { vertexData, subMeshes }
}
