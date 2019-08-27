import * as B from 'babylonjs'
import { buildWorld } from './world'
import draw from './draw'

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

function createScene() {
  const scene = new B.Scene(engine)

  const camera = new B.ArcRotateCamera('camera', 0, 0, 10, new B.Vector3(0.5, 0.5, 0.5), scene) // prettier-ignore

  camera.setPosition(
    new B.Vector3(DIMENSIONS[0] * CHUNK[0], DIMENSIONS[0] * CHUNK[1], -CHUNK[2])
  )

  camera.attachControl(canvas, false)
  camera.panningSensibility = 100

  const light = new B.HemisphericLight('light1', new B.Vector3(0, 1, 0), scene)

  var ground = new B.MeshBuilder.CreateGround(
    'ground',
    { width: DIMENSIONS[0] * CHUNK[0], height: DIMENSIONS[1] * CHUNK[2] },
    scene
  )

  var ground = new B.MeshBuilder.CreateBox('ground', {
    width: DIMENSIONS[0] * CHUNK[0] + 1,
    depth: DIMENSIONS[1] * CHUNK[2] + 1,
    height: Math.floor(CHUNK[1] / 3) + 1
  })

  // ground.position.x += 0.5
  // ground.position.z += 0.5
  ground.position.y += Math.floor(CHUNK[1] / 3) / 2

  const water = new B.StandardMaterial('water', scene)
  water.diffuseColor = new B.Color3(0, 0, 0.7)
  water.alpha = 0.5

  ground.material = water
  ground.isPickable = false

  const meshes = buildWorld(DIMENSIONS, CHUNK, scene)

  meshes.forEach(mesh => {
    mesh.position.x = -(DIMENSIONS[0] * CHUNK[0]) / 2
    mesh.position.z = -(DIMENSIONS[1] * CHUNK[2]) / 2
  })

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

draw(scene)
