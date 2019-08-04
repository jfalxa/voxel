import * as B from 'babylonjs'
import Mat2 from './mat2'

function createRandom(seed) {
  seed = parseInt(seed, 36)
  return index => {
    const x = Math.sin(seed + index) * 10000
    return x - Math.floor(x)
  }
}

function createWorld(w, h, d) {
  const rand = createRandom('coucou')
  return (x, y, z) => {
    if (x < 0 || x >= w) return 0
    else if (y < 0 || y >= h) return 0
    else if (z < 0 || z >= d) return 0
    // else if (x < 4 && y < 4) return 0
    // else return rand(x + w * (y + h * z)) > 0.5 ? 1 : 0;
    else return 1
  }
}

function computeMask(world, chunk, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const mask = new Mat2(chunk[main], chunk[sec])

  const cell = [0, 0, 0]
  const prev = [0, 0, 0]

  cell[axis] = depth
  prev[axis] = depth - 1

  for (let i = 0; i < chunk[main]; i++)
    for (let j = 0; j < chunk[sec]; j++) {
      cell[main] = prev[main] = i
      cell[sec] = prev[sec] = j

      const visible = world(...cell) !== world(...prev)

      mask.set(i, j, visible)
    }

  return mask
}

function scanW(mask, x, y) {
  let w
  for (w = 1; mask.get(x + w, y) && w < mask.w - x; w++) continue
  return w
}

function scanH(mask, x, y, w) {
  let h
  for (h = 1; scanW(mask, x, y + h) >= w && h < mask.h - y; h++) continue
  return h
}

function extractQuads(mask) {
  let position
  const quads = []

  while ((position = mask.first())) {
    const [x, y] = position

    const w = scanW(mask, x, y)
    const h = scanH(mask, x, y, w)

    quads.push([x, y, w, h])
    mask.clear(x, y, w, h)
  }

  return quads
}

function computeVertices(quads2D, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  return quads2D.map(quad => {
    const o = Array(3)
    o[axis] = depth
    o[main] = quad[0] // x
    o[sec] = quad[1] // y

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

function mergeQuads(world, chunk) {
  const quads = []

  // scan each dimension separately
  for (let axis = 0; axis < 3; axis++)
    for (let depth = 0; depth <= chunk[axis]; depth++) {
      const mask = computeMask(world, chunk, axis, depth)
      const quads2D = extractQuads(mask)
      const vertices = computeVertices(quads2D, axis, depth)

      quads.push(...vertices)
    }

  return quads
}

function shift(array, amount) {
  return array.map(e => e + amount)
}

const QUAD_INDICES = [0, 1, 2, 2, 3, 0]

function buildMesh(quads, scene) {
  const allPositions = []
  const allIndices = []

  quads.forEach(positions => {
    const indices = shift(QUAD_INDICES, allPositions.length / 3)
    allPositions.push(...positions)
    allIndices.push(...indices)
  })

  const vertexData = new B.VertexData()
  vertexData.indices = allIndices
  vertexData.positions = allPositions

  var mat = new B.StandardMaterial('', scene)
  mat.backFaceCulling = false
  mat.wireframe = true

  const mesh = new B.Mesh('custom', scene)
  mesh.material = mat

  vertexData.applyToMesh(mesh)

  return mesh
}

export function buildWorld(chunk, scene) {
  const world = createWorld(...chunk)
  const quads = mergeQuads(world, chunk)
  const mesh = buildMesh(quads, scene)

  return mesh
}
