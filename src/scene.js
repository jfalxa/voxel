import * as BABYLON from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'

import * as Colors from './config/colors'
import { SIZE } from './config/grid'

import Draw from './draw'
import Voxels from './voxels'
import Mesh from './mesh'

function initLight(scene) {
  return new BABYLON.HemisphericLight(
    'light1',
    new BABYLON.Vector3(0, 1, 0),
    scene
  )
}

function initCamera(canvas, scene) {
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    Math.PI / 4,
    Math.PI / 3,
    SIZE,
    new BABYLON.Vector3(SIZE / 2, 0, SIZE / 2),
    scene
  )

  camera.attachControl(canvas, false)
  camera.panningSensibility = 128
  camera.lowerRadiusLimit = 1
  camera.upperRadiusLimit = SIZE * 2

  camera.minZ = 0

  camera.checkCollisions = true
  camera.ellipsoid = new BABYLON.Vector3(0.49, 1, 0.49)
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0)

  camera.keysUp.push(87)
  camera.keysRight.push(68)
  camera.keysDown.push(83)
  camera.keysLeft.push(65)

  return camera
}

export default function initScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine)

  scene.gravity = new BABYLON.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true
  scene.clearColor = Colors.Dark1

  initLight(scene)
  initCamera(canvas, scene)

  // const ground = BABYLON.MeshBuilder.CreateGround('ground', {
  //   width: SIZE,
  //   height: SIZE
  // })

  // ground.material = new BABYLON.StandardMaterial('groundmat', scene)
  // ground.material.diffuseColor = Colors.Light1
  // ground.material.specularColor = new BABYLON.Color3.Black()
  // ground.material.backFaceCulling = false

  // ground.position.x = SIZE / 2
  // ground.position.z = SIZE / 2

  const voxels = new Voxels(SIZE, SIZE, SIZE)
  const mesh = new Mesh('voxels', scene)

  mesh.material = new GridMaterial('voxel-grid', scene)
  mesh.material.mainColor = Colors.Light2
  mesh.material.lineColor = Colors.Light1
  mesh.material.majorUnitFrequency = 3
  mesh.material.gridRatio = 1

  scene.draw = new Draw(scene, ({ origin, dimensions, clear }) => {
    voxels.fill(
      origin.x,
      origin.y,
      origin.z,
      dimensions.x,
      dimensions.y,
      dimensions.z,
      clear ? 0 : 1
    )

    mesh.setVoxels(voxels)
    // const box = BABYLON.MeshBuilder.CreateBox(Math.random().toString(36), {
    //   width: dimensions.x,
    //   height: dimensions.y,
    //   depth: dimensions.z
    // })
    // box.position = origin.add(dimensions.scale(0.5))
    // box.material = new GridMaterial('groundMaterial', scene)
    // box.material.mainColor = Colors.Light2
    // box.material.lineColor = Colors.Dark1
    // box.material.majorUnitFrequency = 3
    // box.material.gridOffset.x += dimensions.x / 2 + (origin.x % 3)
    // box.material.gridOffset.y += dimensions.y / 2 + (origin.y % 3)
    // box.material.gridOffset.z += dimensions.z / 2 + (origin.z % 3)
  })

  return scene
}
