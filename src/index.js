import * as BABYLON from '@babylonjs/core'
import buildScene from './scene'

import './ui'

const root = document.getElementById('root')
const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.oncontextmenu = () => false

root.appendChild(canvas)

const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
})

const scene = buildScene(engine, canvas)

function renderLoop() {
  scene.render()
}

function onResize() {
  engine.resize()
}

engine.runRenderLoop(renderLoop)
window.addEventListener('resize', onResize)
