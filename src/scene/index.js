import * as BABYLON from '@babylonjs/core'

import * as Colors from '../config/colors'
import initDraw from '../draw'
import * as Entities from './entities'
import Chrono from '../utils/chrono'

export default function initScene(engine) {
  const scene = new BABYLON.Scene(engine)

  scene.gravity = new BABYLON.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true
  scene.clearColor = Colors.Dark1

  Entities.createLight(scene)
  Entities.createCamera(scene)
  Entities.createGround(scene)

  const world = Entities.createWorld(scene)

  const chrono = new Chrono()

  initDraw(scene, ({ position, dimensions, value }) => {
    chrono.start(`drawing ${dimensions.x * dimensions.y * dimensions.z} voxels`)

    world.fill(
      position.x,
      position.y,
      position.z,
      dimensions.x,
      dimensions.y,
      dimensions.z,
      value
    )

    chrono.step('filled')

    world.render()

    chrono.stop('rendered')
  })

  return scene
}
