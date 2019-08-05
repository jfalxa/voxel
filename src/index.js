import * as B from 'babylonjs'
import { buildWorld } from './world'

const DIMENSIONS = [10, 10]
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

function createScene() {
  const scene = new B.Scene(engine)

  const center = new B.Vector3(
    (DIMENSIONS[0] * CHUNK[0]) / 2,
    CHUNK[1] / 2,
    (DIMENSIONS[1] * CHUNK[2]) / 2
  )

  const camera = new B.ArcRotateCamera('camera', 0, 0, 10, center, scene) // prettier-ignore

  camera.setPosition(
    new B.Vector3(
      DIMENSIONS[0] * CHUNK[0] * 2,
      DIMENSIONS[0] * CHUNK[1] * 2,
      -CHUNK[2] * 2
    )
  )

  camera.attachControl(canvas, false)

  const light = new B.HemisphericLight('light1', new B.Vector3(0, 1, 0), scene)

  buildWorld(DIMENSIONS, CHUNK, scene)

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
