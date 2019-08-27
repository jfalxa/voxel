import OpenSimplexNoise from 'open-simplex-noise'
import { makeCuboid, makeRectangle } from 'fractal-noise'
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

    const isHighEnough = Math.abs(heightmap[x][z] + 0.3) > y / h
    const isHole = holes[x][y][z] > 0.1

    const isFilled = usermap[x][y][z] === 1
    const isCarved = usermap[x][y][z] === -1

    return isFilled || (isHighEnough && !isCarved && !isHole) ? 1 : 0
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

export function buildWorld(dimensions, chunk, scene) {
  const chunks = []

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

      mesh.intersectionBox.position.x = origin[0] + mesh.position.x + chunk[0] / 2 // prettier-ignore
      mesh.intersectionBox.position.z = origin[1] + mesh.position.z + chunk[2] / 2 // prettier-ignore
      mesh.intersectionBox.position.y = chunk[1] / 2

      chunks.push(mesh)
    }

  scene.world = world
  scene.chunks = chunks

  return world
}
