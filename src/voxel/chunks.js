import * as B from 'babylonjs'
import buildMesh from './mesh'

function buildContainer(chunk, origin, scene) {
  const container = B.MeshBuilder.CreateBox(
    'container-' + origin.join('.'),
    {
      width: chunk[0],
      height: chunk[1],
      depth: chunk[2]
    },
    scene
  )

  container.position.x = origin[0] + chunk[0] / 2
  container.position.y = origin[1] + chunk[1] / 2
  container.position.z = origin[2] + chunk[2] / 2

  container.isVisible = false
  container.isPickable = false

  return container
}

function buildChunk(world, materials, chunk, origin, scene) {
  const container = buildContainer(chunk, origin, scene)
  const mesh = buildMesh(container, world, materials, chunk, origin, scene)

  mesh.rebuild = function rebuild() {
    const newMesh = buildChunk(world, materials, chunk, origin, scene)
    newMesh.position = mesh.position

    mesh.dispose()

    return newMesh
  }

  return mesh
}

// prettier-ignore
export default function buildChunks(world, materials, dimensions, chunk, scene) {
  const chunks = []

  for (let i = 0; i < dimensions[0]; i++)
    for (let j = 0; j < dimensions[1]; j++)
      for (let k = 0; k < dimensions[2]; k++) {
        const origin = [i * chunk[0], j * chunk[1], k * chunk[2]]
        const mesh = buildChunk(world, materials, chunk, origin, scene)

        chunks.push(mesh)
      }

  return chunks
}
