import * as B from 'babylonjs'

import { WIDTH, HEIGHT, DEPTH } from './config'
import initScene from './scene'

const root = document.getElementById('root')
const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

root.appendChild(canvas)

const engine = new B.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
})

const start = performance.now()

const scene = initScene(engine, canvas)

const end = performance.now()
console.log('ready:', `${WIDTH}x${HEIGHT}x${DEPTH}`, end - start)

// run the render loop
engine.runRenderLoop(() => {
  scene.render()
})

// the canvas/window resize event handler
window.addEventListener('resize', () => {
  engine.resize()
})
