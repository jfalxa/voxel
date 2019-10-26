import * as BABYLON from '@babylonjs/core'

import { SIZE, FREQUENCY, CENTER } from '../config/grid'
import * as Colors from '../config/colors'
import World from '../voxels/world'
import WorldMesh from '../mesher'

export function createLight(scene) {
  return new BABYLON.HemisphericLight(
    'light1',
    new BABYLON.Vector3(0, 1, 0),
    scene
  )
}

export function createCamera(scene) {
  const camera = new BABYLON.UniversalCamera(
    'camera',
    CENTER.subtractFromFloats(60, -60, 60),
    scene
  )

  camera.setTarget(CENTER)

  camera.minZ = 0

  camera.checkCollisions = true
  camera.ellipsoid = new BABYLON.Vector3(0.49, 1, 0.49)
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0)

  camera.keysUp.push(87)
  camera.keysRight.push(68)
  camera.keysDown.push(83)
  camera.keysLeft.push(65)

  const canvas = scene.getEngine().getRenderingCanvas()
  camera.attachControl(canvas)

  return camera
}

export function createGround(scene) {
  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    width: SIZE,
    height: SIZE
  })

  ground.material = new BABYLON.StandardMaterial('ground-material', scene)
  ground.material.diffuseColor = Colors.Dark2
  ground.material.specularColor = new BABYLON.Color3.Black()
  ground.material.backFaceCulling = false

  ground.position.x = SIZE / 2
  ground.position.y = -0.1
  ground.position.z = SIZE / 2

  return ground
}

export function createWorld(scene) {
  const world = new World(FREQUENCY * 4, FREQUENCY * 4)
  const mesh = new WorldMesh(world, scene)

  return mesh
}
