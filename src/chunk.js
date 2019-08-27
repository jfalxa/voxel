import * as B from 'babylonjs'
import greedyQuads from './greedy'

function computeVertices(quads2D, origin, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  return quads2D.map(quad => {
    const o = Array(3)
    o[axis] = depth
    o[main] = quad[0] // x
    o[sec] = quad[1] // y

    o[0] += origin[0]
    o[2] += origin[1]

    const dw = [0, 0, 0]
    dw[main] = quad[2] // w

    const dh = [0, 0, 0]
    dh[sec] = quad[3] // h

    // prettier-ignore
    return [
      o[0], o[1], o[2], // A
      o[0] + dw[0], o[1] + dw[1], o[2] + dw[2], // B
      o[0] + dw[0] + dh[0], o[1] + dw[1] + dh[1], o[2] + dw[2] + dh[2], // C
      o[0] + dh[0], o[1] + dh[1], o[2] + dh[2] // D
    ];
  })
}

function simplifyMesh(world, chunk, origin) {
  const triangles = []

  // scan each dimension separately
  for (let axis = 0; axis < 3; axis++)
    for (let depth = 0; depth <= chunk[axis]; depth++) {
      const quads2D = greedyQuads(world, chunk, origin, axis, depth)
      const vertices = computeVertices(quads2D, origin, axis, depth)

      triangles.push(...vertices)
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

  triangles.forEach(positions => {
    const indices = shift(QUAD_INDICES, allPositions.length / 3)
    allPositions.push(...positions)
    allIndices.push(...indices)
  })

  const vertexData = new B.VertexData()
  vertexData.indices = allIndices
  vertexData.positions = allPositions

  var mat = new B.StandardMaterial('', scene)
  mat.backFaceCulling = false
  mat.diffuseColor = new B.Color3(0, 0.5, 0)

  const mesh = new B.Mesh('custom', scene)
  mesh.material = mat

  vertexData.applyToMesh(mesh)

  return mesh
}

function rebuildMesh() {
  const postition = mesh.position.clone()
  const rebuilt = buildChunk(world, chunk, origin, scene)

  resbuilt.position = postition
  mesh.dispose()

  return rebuilt
}

export default function buildChunk(world, chunk, origin, scene) {
  const triangles = simplifyMesh(world, chunk, origin)
  const mesh = buildMesh(triangles, scene)

  mesh.rebuild = rebuildMesh

  return mesh
}
