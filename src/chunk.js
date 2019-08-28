import * as B from 'babylonjs'
import greedyQuads from './greedy'

function computeQuadNormal(vertices, world, axis) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const normal = [0, 0, 0]

  // make sure the selected voxels are inside the quad
  const deltas = [[0, 0], [-1, 0], [-1, -1], [0, -1]]

  // check voxels around each corner of the quad
  vertices.forEach((vertex, i) => {
    const prev = [...vertex]
    prev[axis] += -1
    prev[main] += deltas[i][0]
    prev[sec] += deltas[i][1]

    const prevBlock = world(...prev)
    const nextBlock = world(...vertex)

    normal[axis] += prevBlock - nextBlock
  })

  normal[axis] = Math.sign(normal[axis])

  return normal
}

function computeVertices(quads2D, world, origin, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  return quads2D.map(([x, y, w, h]) => {
    // translate to chunk origin
    const o = Array(3)
    o[axis] = origin[axis] + depth
    o[main] = origin[main] + x
    o[sec] = origin[sec] + y

    const dw = [0, 0, 0]
    dw[main] = w

    const dh = [0, 0, 0]
    dh[sec] = h

    const A = [o[0], o[1], o[2]]
    const B = [o[0] + dw[0], o[1] + dw[1], o[2] + dw[2]]
    const C = [o[0] + dw[0] + dh[0], o[1] + dw[1] + dh[1], o[2] + dw[2] + dh[2]]
    const D = [o[0] + dh[0], o[1] + dh[1], o[2] + dh[2]]

    const normal = computeQuadNormal([A, B, C, D], world, axis)
    const normals = [...normal, ...normal, ...normal, ...normal]

    // prettier-ignore
    const vertices = normal[axis] < 0
      ? [...A, ...B, ...C, ...D]
      : [...A, ...D, ...C, ...B]

    return [vertices, normals]
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

const QUAD_INDICES = [0, 1, 2, 2, 3, 0]

function buildMesh(triangles, scene) {
  const allPositions = []
  const allIndices = []
  const allNormals = []

  triangles.forEach(([positions, normals]) => {
    const indices = shift(QUAD_INDICES, allPositions.length / 3)

    allPositions.push(...positions)
    allIndices.push(...indices)
    allNormals.push(...normals)
  })

  const vertexData = new B.VertexData()
  vertexData.indices = allIndices
  vertexData.positions = allPositions
  vertexData.normals = allNormals

  var mat = new B.StandardMaterial('', scene)
  mat.diffuseColor = new B.Color3(0, 0.5, 0)

  const mesh = new B.Mesh('custom', scene)
  mesh.material = mat

  vertexData.applyToMesh(mesh)

  return mesh
}

function initIntersecion(chunk, scene) {
  const intersectionBox = B.MeshBuilder.CreateBox(
    'intersect' + chunk,
    {
      width: chunk[0],
      height: chunk[1],
      depth: chunk[2]
    },
    scene
  )

  intersectionBox.isVisible = false
  intersectionBox.isPickable = false

  return intersectionBox
}

export default function buildChunk(world, chunk, origin, scene) {
  const triangles = simplifyMesh(world, chunk, origin)
  const mesh = buildMesh(triangles, scene)

  mesh.checkCollisions = true
  mesh.intersectionBox = initIntersecion(chunk, scene)

  mesh.rebuild = function rebuildMesh() {
    const rebuilt = buildChunk(world, chunk, origin, scene)

    rebuilt.intersectionBox = mesh.intersectionBox
    rebuilt.position = mesh.position.clone()

    mesh.dispose()

    return rebuilt
  }

  return mesh
}
