import Mask from '../utils/mask'

function computeMask(voxels, axis, level) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const width = voxels.dimensions[main]
  const height = voxels.dimensions[sec]

  const mask = new Mask(width, height)

  const prev = [0, 0, 0]
  const next = [0, 0, 0]

  next[axis] = level
  prev[axis] = level - 1

  for (let i = 0; i < width; i++)
    for (let j = 0; j < height; j++) {
      next[main] = prev[main] = i
      next[sec] = prev[sec] = j

      const a = voxels.get(next[0], next[1], next[2])
      const b = voxels.get(prev[0], prev[1], prev[2])

      // check if the 2 adjacent blocks are solid to find the face type and direction
      const ua = a > 1 ? 1 : a && !b ? 1 : 0
      const ub = b > 1 ? 1 : b && !a ? 1 : 0

      const direction = ua - ub
      const type = Math.max(a, b)

      mask.set(i, j, direction * type)
    }

  return mask
}

function scanWidth(mask, x, y, type, max = Infinity) {
  let w
  for (w = 0; mask.get(x + w, y) === type && w < mask.width - x && w < max; w++)
    continue
  return w
}

function scanHeight(mask, x, y, w, type) {
  let h
  for (
    h = 1;
    scanWidth(mask, x, y + h, type, w) === w && h < mask.height - y;
    h++
  )
    continue
  return h
}

function computeQuads(mask) {
  const quads = []

  let position
  let nextX = 0
  let nextY = 0

  while ((position = mask.next(nextX, nextY))) {
    const x = position[0]
    const y = position[1]

    const type = mask.get(x, y)

    const w = scanWidth(mask, x, y, type)
    const h = scanHeight(mask, x, y, w, type)

    nextX = x + w
    nextY = y

    quads.push([x, y, w, h, type])
    mask.fill(x, y, w, h, 0)
  }

  return quads
}

function computeVertices(quads2D, axis, level) {
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
    o[axis] = level
    o[main] = x
    o[sec] = y

    const direction = Math.sign(type)

    dw[axis] = 0
    dw[main] = direction > 0 ? w : 0
    dw[sec] = direction > 0 ? 0 : h

    dh[axis] = 0
    dh[main] = direction > 0 ? 0 : w
    dh[sec] = direction > 0 ? h : 0

    // prettier-ignore
    const vertices =
    [
      o[0], o[1], o[2],
      o[0] + dw[0], o[1] + dw[1], o[2] + dw[2],
      o[0] + dw[0] + dh[0], o[1] + dw[1] + dh[1], o[2] + dw[2] + dh[2],
      o[0] + dh[0], o[1] + dh[1], o[2] + dh[2]
    ]

    // prettier-ignore
    const uvs = direction > 0 
      ? [0, 0, w, 0, w, h, 0, h] 
      : [0, 0, 0, h, w, h, w, 0]

    quads3D[i] = [vertices, uvs, Math.abs(type)]
  }

  return quads3D
}

export default function simplify(voxels) {
  let triangles = []

  // scan each dimension separately
  for (let axis = 0; axis < 3; axis++)
    for (let level = 0; level <= voxels.dimensions[axis]; level++) {
      const mask = computeMask(voxels, axis, level)

      const quads2D = computeQuads(mask)
      const quads3D = computeVertices(quads2D, axis, level)

      triangles.push(...quads3D)
    }

  return triangles
}
