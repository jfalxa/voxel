import Mask from '../utils/mask'

function computeMask(world, chunk, origin, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const mask = new Mask(chunk[main], chunk[sec], Int8Array)

  const prev = [0, 0, 0]
  const next = [0, 0, 0]

  next[axis] = origin[axis] + depth
  prev[axis] = origin[axis] + depth - 1

  for (let i = 0; i < chunk[main]; i++)
    for (let j = 0; j < chunk[sec]; j++) {
      next[main] = prev[main] = origin[main] + i
      next[sec] = prev[sec] = origin[sec] + j

      const a = world(next[0], next[1], next[2])
      const b = world(prev[0], prev[1], prev[2])

      // check if the 2 adjacent blocks are solid to find the face type and direction
      const ua = a > 1 ? 1 : a && !b ? 1 : 0
      const ub = b > 1 ? 1 : b && !a ? 1 : 0

      const direction = ua - ub
      const type = Math.max(a, b)

      mask.set(i, j, direction * type)
    }

  return mask
}

function scanW(mask, x, y, type, max = Infinity) {
  let w
  for (w = 0; mask.get(x + w, y) === type && w < mask.w - x && w < max; w++)
    continue
  return w
}

function scanH(mask, x, y, w, type) {
  let h
  for (h = 1; scanW(mask, x, y + h, type, w) === w && h < mask.h - y; h++)
    continue
  return h
}

function extractQuads(mask) {
  const quads = []

  let position
  let nextX = 0
  let nextY = 0

  while ((position = mask.next(nextX, nextY))) {
    const x = position[0]
    const y = position[1]

    const type = mask.get(x, y)

    const w = scanW(mask, x, y, type)
    const h = scanH(mask, x, y, w, type)

    nextX = x + w
    nextY = y

    quads.push([x, y, w, h, Math.abs(type)])
    mask.clear(x, y, w, h)
  }

  return quads
}

export default function greedyQuads(world, chunk, origin, axis, depth) {
  const mask = computeMask(world, chunk, origin, axis, depth)
  const quads2D = extractQuads(mask)

  return quads2D
}
