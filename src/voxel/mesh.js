import * as B from 'babylonjs'
import greedyQuads from './greedy'
import { BlockSettings } from '../world/block-types'

const QUAD_INDICES = [0, 1, 2, 2, 3, 0]

const DEFAULT_OPTIONS = {
  checkCollisions: true
}

function shift(array, amount) {
  const shifted = Array(array.length)
  for (let i = 0; i < array.length; i++) shifted[i] = array[i] + amount
  return shifted
}

function applyMeshOptions(mesh, type) {
  const options = BlockSettings[type].meshOptions || {}

  for (const prop in DEFAULT_OPTIONS) {
    mesh[prop] = DEFAULT_OPTIONS[prop]
  }

  for (const prop in options) {
    mesh[prop] = options[prop]
  }
}

function getDirection(vertex, world, origin, axis) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const prev = Array(3)
  prev[axis] = origin[axis] + vertex[axis] - 1
  prev[main] = origin[main] + vertex[main]
  prev[sec] = origin[sec] + vertex[sec]

  const next = Array(3)
  next[axis] = origin[axis] + vertex[axis]
  next[main] = origin[main] + vertex[main]
  next[sec] = origin[sec] + vertex[sec]

  const prevBlock = world(prev[0], prev[1], prev[2])
  const nextBlock = world(next[0], next[1], next[2])

  return prevBlock === nextBlock ? 0 : prevBlock > nextBlock ? 1 : -1
}

function computeVertices(quads2D, world, origin, axis, depth) {
  const quads3D = Array(quads2D.length)

  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const o = Array(3)
  const dw = Array(3)
  const dh = Array(3)

  for (let i = 0; i < quads2D.length; i++) {
    const quad = quads2D[i]

    const x = quad[0]
    const y = quad[1]
    const w = quad[2]
    const h = quad[3]
    const type = quad[4]

    // translate to chunk origin
    o[axis] = depth
    o[main] = x
    o[sec] = y

    const direction = getDirection(o, world, origin, axis)

    dw[axis] = 0
    dw[main] = direction < 0 ? w : 0
    dw[sec] = direction < 0 ? 0 : h

    dh[axis] = 0
    dh[main] = direction < 0 ? 0 : w
    dh[sec] = direction < 0 ? h : 0

    // prettier-ignore
    const vertices =
    [
      o[0], o[1], o[2],
      o[0] + dw[0], o[1] + dw[1], o[2] + dw[2],
      o[0] + dw[0] + dh[0], o[1] + dw[1] + dh[1], o[2] + dw[2] + dh[2],
      o[0] + dh[0], o[1] + dh[1], o[2] + dh[2]
    ]

    // prettier-ignore
    const uvs = direction < 0 
      ? [0, 0, w, 0, w, h, 0, h] 
      : [0, 0, 0, h, w, h, w, 0]

    quads3D[i] = [vertices, uvs, type]
  }

  return quads3D
}

function simplifyMesh(world, chunk, origin) {
  let triangles = []

  // scan each dimension separately
  for (let axis = 0; axis < 3; axis++)
    for (let depth = 0; depth <= chunk[axis]; depth++) {
      const quads2D = greedyQuads(world, chunk, origin, axis, depth)
      const quads3D = computeVertices(quads2D, world, origin, axis, depth)

      triangles.push(...quads3D)
    }

  return triangles
}

// prettier-ignore
export default function buildMesh(container, world, blockTypes, chunk, origin, scene) {
  const triangles = simplifyMesh(world, chunk, origin)

  const allPositions = {}
  const allIndices = {}
  const allUVs = {}

  for (let i = 0, len=triangles.length; i < len; i++) {
    const data = triangles[i]

    const positions = data[0]
    const uvs = data[1]
    const type = data[2]

    if (!allPositions[type]) {
      allPositions[type] = []
      allIndices[type] = []
      allUVs[type] = []
    }

    const indices = shift(QUAD_INDICES, allPositions[type].length / 3)

    allPositions[type].push(...positions)
    allIndices[type].push(...indices)
    allUVs[type].push(...uvs)
  }

  for (const type in allPositions) {
    const mesh = new B.Mesh('blocks' + type, scene)
    mesh.parent = container
    mesh.material = blockTypes[type]

    const vertexData = new B.VertexData()
    vertexData.positions = allPositions[type]
    vertexData.indices = allIndices[type]
    vertexData.uvs = allUVs[type]

    const normals = []
    B.VertexData.ComputeNormals(allPositions[type], allIndices[type], normals)
    vertexData.normals = normals

    vertexData.applyToMesh(mesh)
    applyMeshOptions(mesh, type)

    mesh.position.x = -chunk[0] / 2
    mesh.position.y = -chunk[1] / 2
    mesh.position.z = -chunk[2] / 2
  }

  return container
}
