import * as B from 'babylonjs'

import { buildWorld } from './world'
import initDraw from './draw'

const DIMENSIONS = [4, 4]
const CHUNK = [32, 32, 32]

const root = document.getElementById('root')
const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

root.appendChild(canvas)

const engine = new B.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
})

function initCamera(scene) {
  const camera = new B.UniversalCamera(
    'camera',
    new B.Vector3(
      DIMENSIONS[0] * CHUNK[0],
      DIMENSIONS[0] * CHUNK[1],
      -CHUNK[2]
    ),
    scene
  )

  camera.setTarget(new B.Vector3(0.5, 0.5, 0.5))
  camera.attachControl(canvas, false)

  camera.keysUp.push(87)
  camera.keysRight.push(68)
  camera.keysDown.push(83)
  camera.keysLeft.push(65)

  return camera
}

function initLight(scene) {
  return new B.HemisphericLight('light1', new B.Vector3(0, 1, 0), scene)
}

function initGround(scene) {
  var ground = new B.MeshBuilder.CreateGround(
    'ground',
    { width: DIMENSIONS[0] * CHUNK[0], height: DIMENSIONS[1] * CHUNK[2] },
    scene
  )

  return ground
}

function initWater(scene) {
  var water = new B.MeshBuilder.CreateBox('ground', {
    width: DIMENSIONS[0] * CHUNK[0] + 1,
    depth: DIMENSIONS[1] * CHUNK[2] + 1,
    height: Math.floor(CHUNK[1] / 3) + 1
  })

  water.position.y += Math.floor(CHUNK[1] / 3) / 2

  const blue = new B.StandardMaterial('blue', scene)
  blue.diffuseColor = new B.Color3(0, 0, 0.7)
  blue.alpha = 0.5

  water.material = blue
  water.isPickable = false

  return water
}

function initWorld(scene) {
  return buildWorld(DIMENSIONS, CHUNK, scene)
}

function createScene() {
  const scene = new B.Scene(engine)

  initCamera(scene)
  initLight(scene)
  initGround(scene)
  initWater(scene)
  initWorld(scene)
  initDraw(scene)

  return scene
}

const scene = createScene()

// run the render loop
engine.runRenderLoop(() => {
  scene.render()
})

// the canvas/window resize event handler
window.addEventListener('resize', () => {
  engine.resize()
})
