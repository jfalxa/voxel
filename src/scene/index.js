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

  initDraw(scene, ({ origin, dimensions, clear }) => {
    mesh.voxels.fill(
      origin.x,
      origin.y,
      origin.z,
      dimensions.x,
      dimensions.y,
      dimensions.z,
      clear ? 0 : 1
    )

    const { vertexData } = buildVertexData(mesh.voxels)

    vertexData.applyToMesh(mesh)
  })

  return scene
}
