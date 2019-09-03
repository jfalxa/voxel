import OpenSimplexNoise from 'open-simplex-noise'

import { WATER_LEVEL } from '../config'
import * as BlockTypes from './block-types'
import Mat3 from '../utils/mat3'
import { fractal2, fractal3 } from '../utils/fractal'

function arr3d(w, h, d) {
  const arr = Array(w)
  for (let x = 0; x < w; x++) {
    arr[x] = Array(h)
    for (let y = 0; y < h; y++) {
      arr[x][y] = Array(d)
    }
  }
  return arr
}

export default function buildWorld(dimensions, chunk) {
  const w = dimensions[0] * chunk[0]
  const h = dimensions[1] * chunk[1]
  const d = dimensions[2] * chunk[2]

  const simplex = new OpenSimplexNoise('ach so richtig genau')

  const heightmap = fractal2(w, d, simplex, {
    scale: 0.01,
    octaves: 3,
    persistence: 0.6
  })

  const holes = fractal3(w, h, d, simplex, {
    scale: 0.04,
    amplitude: 0.5,
    persistence: 2
  })

  const usermap = new Mat3(w, h, d, Int8Array)

  function world(x, y, z) {
    if (x < 0 || x >= w) return 0
    if (y < 0 || y >= h) return 0
    if (z < 0 || z >= d) return 0

    const userblock = usermap.get(x, y, z)

    if (y === 0) return BlockTypes.SAND
    if (userblock > 0) return userblock

    const availableHeight =
      Math.abs(heightmap.get(x, z)) - (y - WATER_LEVEL / 2) / h

    const isCarved = userblock === -1
    const isHole = holes.get(x, y, z) > 0.2
    const isEmpty = availableHeight < 0 || isHole || isCarved

    if (isEmpty && y <= WATER_LEVEL) return BlockTypes.WATER

    if (isCarved) return BlockTypes.AIR

    if (availableHeight < 0) return BlockTypes.AIR
    if (availableHeight <= 1 / h)
      return y < WATER_LEVEL - 1 ? BlockTypes.SAND : BlockTypes.GRASS
    if (availableHeight < 0.08) return BlockTypes.DIRT
    if (availableHeight < 1) return BlockTypes.STONE

    return BlockTypes.AIR
  }

  world.fill = (origin, dimensions, value) => {
    const minX = Math.max(0, origin.x)
    const minY = Math.max(0, origin.y)
    const minZ = Math.max(0, origin.z)

    const maxX = Math.min(w, origin.x + dimensions.x)
    const maxY = Math.min(h, origin.y + dimensions.y)
    const maxZ = Math.min(d, origin.z + dimensions.z)

    for (let x = minX; x < maxX; x++)
      for (let y = minY; y < maxY; y++)
        for (let z = minZ; z < maxZ; z++) {
          usermap.set(x, y, z, value)
        }
  }

  return world
}
