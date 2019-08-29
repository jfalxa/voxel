import OpenSimplexNoise from 'open-simplex-noise'
import { makeCuboid, makeRectangle } from 'fractal-noise'

import { WATER_LEVEL } from './config'
import * as BlockTypes from './blocks-types'
import buildChunk from './chunk'

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

function createWorld(w, h, d) {
  const simplex = new OpenSimplexNoise('ach so richtig genau')
  const noise2D = simplex.noise2D.bind(simplex)
  const noise3D = simplex.noise3D.bind(simplex)

  const usermap = arr3d(w, h, d)

  const heightmap = makeRectangle(w, d, noise2D, {
    frequency: 0.01,
    octaves: 3,
    persistence: 0.6
  })

  const holes = makeCuboid(w, h, d, noise3D, {
    frequency: 0.04,
    amplitude: 0.5,
    persistence: 2
  })

  function world(x, y, z) {
    if (x < 0 || x >= w) return 0
    if (y < 0 || y >= h) return 0
    if (z < 0 || z >= d) return 0

    if (usermap[x][y][z] > 0) return usermap[x][y][z]

    const isCarved = usermap[x][y][z] === 0
    const isHighEnough = Math.abs(heightmap[x][z] + 0.3) > y / h
    const isHole = holes[x][y][z] > 0.1
    const isEmpty = !isHighEnough || isHole || isCarved

    if (isEmpty && y <= WATER_LEVEL) return BlockTypes.WATER
    if (usermap[x][y][z] === 0) return BlockTypes.AIR
    if (isHighEnough && !isHole) return BlockTypes.DIRT

    return BlockTypes.AIR
  }

  world.dimensions = [w, h, d]

  world.fill = (origin, dimensions, value) => {
    // prettier-ignore
    for (let x = Math.max(0, origin.x); x < Math.min(w, origin.x + dimensions.x); x++)
      for (let y = Math.max(0, origin.y); y < Math.min(h, origin.y + dimensions.y); y++) 
        for (let z = Math.max(0, origin.z); z < Math.min(d, origin.z + dimensions.z); z++) { 
            usermap[x][y][z] = value
          }
  }

  return world
}

export default function buildWorld(dimensions, chunk, scene) {
  const world = createWorld(
    dimensions[0] * chunk[0],
    dimensions[1] * chunk[1],
    dimensions[2] * chunk[2]
  )

  scene.world = world
  scene.chunks = []

  for (let i = 0; i < dimensions[0]; i++)
    for (let j = 0; j < dimensions[1]; j++)
      for (let k = 0; k < dimensions[2]; k++) {
        const origin = [i * chunk[0], j * chunk[1], k * chunk[2]]
        const mesh = buildChunk(world, chunk, origin, scene)

        scene.chunks.push(mesh)
      }

  return world
}
