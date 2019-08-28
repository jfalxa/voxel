import * as B from 'babylonjs'

import { WIDTH, HEIGHT, DEPTH, WATER_LEVEL, DIMENSIONS, CHUNK } from './config'

import buildWorld from './world'
import initDraw from './draw'
import initMaterials from './materials'

function initCamera(scene, canvas) {
  const zoom = -1.1
  const pov = new B.Vector3(zoom * WIDTH, zoom * -1.5 * HEIGHT, zoom * DEPTH)

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
    { width: WIDTH, height: DEPTH },
    scene
  )

  const beige = new B.StandardMaterial('beige', scene)
  beige.diffuseColor = new B.Color3(0.96, 0.96, 0.86)

  ground.material = beige
  ground.checkCollisions = true

  return ground
}

function initWater(scene) {
  scene.fogMode = B.Scene.FOGMODE_EXP2

  const colorfogwater = new B.Color3(0.04, 0.3, 0.5)
  const colorfogAmbient = new B.Color3(0.8, 0.8, 0.9)

  scene.registerBeforeRender(() => {
    if (scene.activeCamera.position.y <= WATER_LEVEL) {
      scene.fogColor = colorfogwater
      scene.fogDensity = 0.04
    } else {
      scene.fogColor = colorfogAmbient
      scene.fogDensity = 0.00001
    }
  })
}

function initWorld(scene) {
  return buildWorld(DIMENSIONS, CHUNK, scene)
}

export default function initScene(engine, canvas) {
  const scene = new B.Scene(engine)

  scene.gravity = new B.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true

  initLight(scene)
  initGround(scene)
  initWater(scene)
  initMaterials(scene)
  initWorld(scene)
  initDraw(scene)
  initCamera(scene, canvas)

  return scene
}
