import OpenSimplexNoise from 'open-simplex-noise'
import { makeCuboid, makeRectangle } from 'fractal-noise'
import buildChunk from './chunk'

function createWorld(w, h, d) {
  const simplex = new OpenSimplexNoise('ach so richtig genau')
  const noise2D = simplex.noise2D.bind(simplex)
  const noise3D = simplex.noise3D.bind(simplex)

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

  return (x, y, z) => {
    if (x < 0 || x >= w) return 0
    if (y < 0 || y >= h) return 0
    if (z < 0 || z >= d) return 0

    const isHighEnough = Math.abs(heightmap[x][z] + 0.3) > y / h
    const isHole = holes[x][y][z] > 0.1

    return isHighEnough && !isHole ? 1 : 0
  }
}

export function buildWorld(dimensions, chunk, scene) {
  const world = createWorld(
    dimensions[0] * chunk[0],
    chunk[1],
    dimensions[1] * chunk[2]
  )

  for (let i = 0; i < dimensions[0]; i++)
    for (let j = 0; j < dimensions[1]; j++) {
      const origin = [i * chunk[0], j * chunk[2]]
      const mesh = buildChunk(world, chunk, origin, scene)

      mesh.position.x = -(dimensions[0] * chunk[0]) / 2
      mesh.position.z = -(dimensions[1] * chunk[2]) / 2
    }

  scene.world = world

  return world
}
