import * as B from 'babylonjs'
import greedyQuads from './greedy'
import { BlockSettings } from './blocks-types'

const QUAD_INDICES = [0, 1, 2, 2, 3, 0]

const DEFAULT_OPTIONS = {
  checkCollisions: true
}

function getDirection(vertex, world, origin, axis) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const prev = [...vertex]
  prev[axis] += origin[axis] - 1
  prev[main] += origin[main]
  prev[sec] += origin[sec]

  const next = [...vertex]
  next[axis] += origin[axis]
  next[main] += origin[main]
  next[sec] += origin[sec]

  const prevBlock = world(...prev)
  const nextBlock = world(...next)

  return prevBlock === nextBlock ? 0 : prevBlock > nextBlock ? 1 : -1
}

function computeVertices(quads2D, world, origin, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  return quads2D.map(([x, y, w, h, type]) => {
    // translate to chunk origin
    const o = Array(3)
    o[axis] = depth
    o[main] = x
    o[sec] = y

    const dw = [0, 0, 0]
    dw[main] = w

    const dh = [0, 0, 0]
    dh[sec] = h

    const A = [o[0], o[1], o[2]]
    const B = [o[0] + dw[0], o[1] + dw[1], o[2] + dw[2]]
    const C = [o[0] + dw[0] + dh[0], o[1] + dw[1] + dh[1], o[2] + dw[2] + dh[2]]
    const D = [o[0] + dh[0], o[1] + dh[1], o[2] + dh[2]]

    const direction = getDirection(A, world, origin, axis)

    // prettier-ignore
    const vertices = direction < 0
    ? [...A, ...B, ...C, ...D]
    : [...A, ...D, ...C, ...B]

    // prettier-ignore
    const uvs = direction < 0 
    ? [0, 0, w, 0, w, h, 0, h] 
    : [0, 0, 0, h, w, h, w, 0]

    return [vertices, uvs, type]
  })
}

function simplifyMesh(world, chunk, origin) {
  const triangles = []

  // scan each dimension separately
  for (let axis = 0; axis < 3; axis++)
    for (let depth = 0; depth <= chunk[axis]; depth++) {
      const quads2D = greedyQuads(world, chunk, origin, axis, depth)
      const quads3D = computeVertices(quads2D, world, origin, axis, depth)

      triangles.push(...quads3D)
    }

  return triangles
}

function shift(array, amount) {
  return array.map(e => e + amount)
}

function buildContainer(chunk, origin, scene) {
  const container = B.MeshBuilder.CreateBox(
    'intersect' + chunk,
    {
      width: chunk[0],
      height: chunk[1],
      depth: chunk[2]
    },
    scene
  )

  const shiftX = -scene.world.dimensions[0] / 2
  const shiftZ = -scene.world.dimensions[2] / 2

  container.position.x = origin[0] + chunk[0] / 2 + shiftX
  container.position.y = origin[1] + chunk[1] / 2
  container.position.z = origin[2] + chunk[2] / 2 + shiftZ

  container.isVisible = false
  container.isPickable = false

  return container
}

function applyMeshOptions(mesh, type) {
  const options =
    'meshOptions' in BlockSettings[type]
      ? { ...DEFAULT_OPTIONS, ...BlockSettings[type].meshOptions }
      : DEFAULT_OPTIONS

  for (const prop in options) {
    mesh[prop] = options[prop]
  }
}

function buildMesh(triangles, chunk, origin, scene) {
  const container = buildContainer(chunk, origin, scene)

  const allPositions = {}
  const allIndices = {}
  const allUVs = {}

  triangles.forEach(([positions, uvs, type]) => {
    allPositions[type] = allPositions[type] || []
    allIndices[type] = allIndices[type] || []
    allUVs[type] = allUVs[type] || []

    const indices = shift(QUAD_INDICES, allPositions[type].length / 3)
    allPositions[type].push(...positions)
    allIndices[type].push(...indices)
    allUVs[type].push(...uvs)
  })

  Object.keys(allPositions).forEach(type => {
    const mesh = new B.Mesh('blocks' + type, scene)
    mesh.parent = container
    mesh.material = scene.blockAtlas[type].material

    const vertexData = new B.VertexData()
    vertexData.indices = allIndices[type]
    vertexData.positions = allPositions[type]
    vertexData.uvs = allUVs[type]

    const normals = []
    B.VertexData.ComputeNormals(allPositions[type], allIndices[type], normals)
    vertexData.normals = normals

    vertexData.applyToMesh(mesh)
    applyMeshOptions(mesh, type)

    mesh.position.x = -chunk[0] / 2
    mesh.position.y = -chunk[1] / 2
    mesh.position.z = -chunk[2] / 2
  })

  return container
}

export default function buildChunk(world, chunk, origin, scene) {
  const triangles = simplifyMesh(world, chunk, origin)
  const mesh = buildMesh(triangles, chunk, origin, scene)

  mesh.rebuild = function rebuildMesh() {
    const rebuilt = buildChunk(world, chunk, origin, scene)
    rebuilt.position = mesh.position.clone()

    mesh.dispose()

    return rebuilt
  }

  return mesh
}
