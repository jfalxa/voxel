import * as BABYLON from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'

import { SIZE, FREQUENCY } from '../config/grid'
import * as Colors from '../config/colors'
import Voxels from '../utils/voxels'

export function createLight(scene) {
  return new BABYLON.HemisphericLight(
    'light1',
    new BABYLON.Vector3(0, 1, 0),
    scene
  )
}

export function createCamera(scene) {
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    (5 * Math.PI) / 4,
    Math.PI / 3,
    SIZE * 2,
    new BABYLON.Vector3(SIZE / 2, 0, SIZE / 2),
    scene
  )

  camera.minZ = 0
  camera.panningSensibility = 128
  camera.lowerRadiusLimit = 1
  camera.upperRadiusLimit = SIZE * 2

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
  ground.position.z = SIZE / 2

  return ground
}

export function createVoxels(scene) {
  const mesh = new BABYLON.Mesh('voxels', scene)
  mesh.voxels = new Voxels(SIZE, SIZE, SIZE)

  mesh.material = new GridMaterial('voxels-material', scene)
  mesh.material.mainColor = Colors.Light2
  mesh.material.lineColor = Colors.Light1
  mesh.material.majorUnitFrequency = FREQUENCY

  return mesh
}
