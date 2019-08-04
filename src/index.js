import * as B from 'babylonjs'
import { buildWorld } from './world'

const CHUNK = [16, 16, 16]

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

  const camera = new B.ArcRotateCamera('camera', 0, 0, 10, new B.Vector3(0.5, 0.5, 0.5), scene) // prettier-ignore
  camera.setPosition(new B.Vector3(CHUNK[0] * 2, CHUNK[1] * 2, -CHUNK[2] * 2))
  camera.attachControl(canvas, false)

  const light = new B.HemisphericLight('light1', new B.Vector3(0, 1, 0), scene)

  // const box = new B.MeshBuilder.CreateBox('box', { size: 1 }, scene)

  const mesh = buildWorld(CHUNK, scene)

  mesh.position.x = -CHUNK[0] / 2
  mesh.position.y = -CHUNK[1] / 2
  mesh.position.z = -CHUNK[2] / 2

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
