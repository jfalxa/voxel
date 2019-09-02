import * as B from 'babylonjs'

import { WIDTH, HEIGHT, DEPTH } from './config'
import buildScene from './scene'

const root = document.getElementById('root')
const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.oncontextmenu = false

root.appendChild(canvas)

const engine = new B.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
})

const start = performance.now()

const scene = buildScene(engine, canvas)

const end = performance.now()
console.log('ready:', `${WIDTH}x${HEIGHT}x${DEPTH}`, end - start)

function renderLoop() {
  scene.render()
}

function onResize() {
  engine.resize()
}

engine.runRenderLoop(renderLoop)
window.addEventListener('resize', onResize)
