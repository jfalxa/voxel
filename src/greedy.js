import Mat2 from './mat2'

function computeMask(world, chunk, origin, axis, depth) {
  const main = (axis + 1) % 3
  const sec = (axis + 2) % 3

  const mask = new Mat2(chunk[main], chunk[sec])

  const prev = [0, 0, 0]
  const next = [0, 0, 0]

  next[axis] = origin[axis] + depth
  prev[axis] = origin[axis] + depth - 1

  for (let i = 0; i < chunk[main]; i++)
    for (let j = 0; j < chunk[sec]; j++) {
      next[main] = prev[main] = origin[main] + i
      next[sec] = prev[sec] = origin[sec] + j

      const a = world(...next)
      const b = world(...prev)

      mask.set(i, j, a - b)
    }

  return mask
}

function scanW(mask, x, y, type = mask.get(x, y)) {
  let w
  if (!type) return 0
  for (w = 0; mask.get(x + w, y) === type && w < mask.w - x; w++) continue
  return w
}

function scanH(mask, x, y, w) {
  let h
  const type = mask.get(x, y)
  for (h = 0; scanW(mask, x, y + h, type) >= w && h < mask.h - y; h++) continue
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

export default function greedyQuads(world, chunk, origin, axis, depth) {
  const mask = computeMask(world, chunk, origin, axis, depth)
  const quads2D = extractQuads(mask)

  return quads2D
}
