import * as BABYLON from '@babylonjs/core'

import * as Colors from '../config/colors'
import initDraw from '../draw'
import buildVertexData from '../mesher'
import * as Entities from './entities'

export default function initScene(engine) {
  const scene = new BABYLON.Scene(engine)

  scene.gravity = new BABYLON.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true
  scene.clearColor = Colors.Dark1

  Entities.createLight(scene)
  Entities.createCamera(scene)
  Entities.createGround(scene)

  const mesh = Entities.createVoxels(scene)

  initDraw(scene, ({ position, dimensions, value }) => {
    mesh.voxels.fill(
      position.x,
      position.y,
      position.z,
      dimensions.x,
      dimensions.y,
      dimensions.z,
      value
    )

    console.log(mesh.voxels)

    const start = performance.now()
    const { vertexData } = buildVertexData(mesh.voxels)
    const end = performance.now()

    console.log('Computed in:', (end - start).toFixed(3))

    if (vertexData.indices.length === 0) {
      mesh.geometry.dispose()
    } else {
      vertexData.applyToMesh(mesh, true)
    }
  })

  window.scene = scene
  window.BABYLON = BABYLON

  return scene
}
