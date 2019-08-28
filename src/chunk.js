import * as B from 'babylonjs'
import greedyQuads from './greedy'

function computeNormal(vertex, world, axis) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const normal = Array(3)
  normal[main] = 0
  normal[sec] = 0

  const nextHalf = []
  const prevHalf = []

  // split the 8 neighbours around the vertex
  // into two halves separated by the given axis
  for (let i = -1; i < 1; i++)
    for (let j = -1; j < 1; j++) {
      const vn = Array(3)
      vn[axis] = vertex[axis]
      vn[main] = vertex[main] + i
      vn[sec] = vertex[sec] + j

      const vp = Array(3)
      vp[axis] = vertex[axis] - 1
      vp[main] = vertex[main] + i
      vp[sec] = vertex[sec] + j

      nextHalf.push(vn)
      prevHalf.push(vp)
    }

  // compare both halves and check which one has more space
  const nextBlocks = nextHalf.reduce((blocks, v) => blocks + world(...v), 0)
  const prevBlocks = prevHalf.reduce((blocks, v) => blocks + world(...v), 0)

  normal[axis] = nextBlocks <= prevBlocks ? 1 : -1

  return normal
}

function computeVertices(quads2D, world, origin, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  return quads2D.map(([x, y, w, h]) => {
    const o = Array(3)
    o[axis] = depth
    o[main] = x
    o[sec] = y

    // translate to chunk origin
    o[0] += origin[0]
    o[2] += origin[1]

    const dw = [0, 0, 0]
    dw[main] = w

    const dh = [0, 0, 0]
    dh[sec] = h

    const A = [o[0], o[1], o[2]]
    const B = [o[0] + dw[0], o[1] + dw[1], o[2] + dw[2]]
    const C = [o[0] + dw[0] + dh[0], o[1] + dw[1] + dh[1], o[2] + dw[2] + dh[2]]
    const D = [o[0] + dh[0], o[1] + dh[1], o[2] + dh[2]]

    // prettier-ignore
    const vertices = [
      ...A, // A
      ...B, // B
      ...C, // C
      ...D // D
    ];

    const normals = [
      ...computeNormal(A, world, axis),
      ...computeNormal(B, world, axis),
      ...computeNormal(C, world, axis),
      ...computeNormal(D, world, axis)
    ]

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
  mat.backFaceCulling = false
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