import * as B from 'babylonjs'

import { buildWorld } from './world'
import initDraw from './draw'

const DIMENSIONS = [4, 4]
const CHUNK = [16, 64, 16]

function initCamera(scene, canvas) {
  const zoom = -1.1

  const pov = new B.Vector3(
    zoom * CHUNK[0] * DIMENSIONS[0],
    zoom * -1.5 * CHUNK[1],
    zoom * CHUNK[2] * DIMENSIONS[1]
  )

  const camera = new B.UniversalCamera('camera', pov, scene)
  camera.canvas = canvas

  camera.attachControl(canvas, false)
  camera.setTarget(new B.Vector3(0.5, 0.5, 0.5))

  camera.checkCollisions = true
  // camera.applyGravity = true

  camera.ellipsoid = new B.Vector3(1, 2, 1)

  camera.keysUp.push(87)
  camera.keysRight.push(68)
  camera.keysDown.push(83)
  camera.keysLeft.push(65)

  scene.onKeyboardObservable.add(info => {
    switch (info.type) {
      case B.KeyboardEventTypes.KEYDOWN:
      case B.KeyboardEventTypes.KEYUP:
        if (info.event.key === ' ') {
          scene.gravity.y *= -1
          scene.render()
        }
        break
    }
  })

  return camera
}

function initLight(scene) {
  return new B.HemisphericLight('light1', new B.Vector3(0, 1, 0), scene)
}

function initGround(scene) {
  const ground = new B.MeshBuilder.CreateGround(
    'ground',
    { width: DIMENSIONS[0] * CHUNK[0], height: DIMENSIONS[1] * CHUNK[2] },
    scene
  )

  const beige = new B.StandardMaterial('beige', scene)
  beige.diffuseColor = new B.Color3(0.96, 0.96, 0.86)

  ground.material = beige
  ground.checkCollisions = true

  return ground
}

function initWater(scene) {
  var water = new B.MeshBuilder.CreateBox(
    'ground',
    {
      width: DIMENSIONS[0] * CHUNK[0] + 1,
      depth: DIMENSIONS[1] * CHUNK[2] + 1,
      height: Math.floor(CHUNK[1] / 3) + 1
    },
    scene
  )

  water.position.y += Math.floor(CHUNK[1] / 3) / 2

  const blue = new B.StandardMaterial('blue', scene)
  blue.diffuseColor = new B.Color3(0, 0, 0.7)
  blue.alpha = 0.5
  blue.backFaceCulling = false

  water.material = blue
  water.isPickable = false

  scene.fogMode = B.Scene.FOGMODE_EXP2

  const colorfogwater = new B.Color3(0.04, 0.3, 0.5)
  const colorfogAmbient = new B.Color3(0.8, 0.8, 0.9)

  scene.registerBeforeRender(() => {
    if (scene.activeCamera.position.y <= Math.floor(CHUNK[1] / 3) + 1) {
      scene.fogColor = colorfogwater
      scene.fogDensity = 0.04
    } else {
      scene.fogColor = colorfogAmbient
      scene.fogDensity = 0.00001
    }
  })

  return water
}

function initWorld(scene) {
  return buildWorld(DIMENSIONS, CHUNK, scene)
}

export default function initScene(engine, canvas) {
  const scene = new B.Scene(engine)

  initLight(scene)
  initGround(scene)
  initWater(scene)
  initWorld(scene)
  initDraw(scene)
  initCamera(scene, canvas)

  scene.gravity = new B.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true

  return scene
}
