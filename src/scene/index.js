import * as BABYLON from '@babylonjs/core'

import { CHUNK } from '../config/grid'
import * as Colors from '../config/colors'
import initDraw from '../draw'
import createVoxels from '../voxels'
import * as Entities from './entities'

export default function initScene(engine) {
  const scene = new BABYLON.Scene(engine)

  scene.gravity = new BABYLON.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true
  scene.clearColor = Colors.Dark1

  Entities.createLight(scene)
  Entities.createCamera(scene)
  Entities.createGround(scene)

  const voxels = createVoxels(CHUNK[0], CHUNK[1], CHUNK[2], scene)

  window.voxels = voxels

  initDraw(scene, ({ position, dimensions, value }) => {
    voxels.fill(position, dimensions, value)
  })

  return scene
}
