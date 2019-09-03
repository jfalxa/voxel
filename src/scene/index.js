import * as B from 'babylonjs'

import { WATER_LEVEL, DIMENSIONS, CHUNK } from '../config'

import initCamera from './camera'
import initDraw from './draw'
import buildGUI from './gui'
import buildWorld from '../world'
import buildChunks from '../voxel/chunks'
import buildMaterials from '../voxel/materials'

function initLight(scene) {
  return new B.HemisphericLight('light1', new B.Vector3(0, 1, 0), scene)
}

function initWater(scene) {
  scene.fogMode = B.Scene.FOGMODE_EXP2

  const colorfogwater = new B.Color3(0.04, 0.3, 0.5)
  const colorfogAmbient = new B.Color3(0.8, 0.8, 0.9)

  scene.registerBeforeRender(() => {
    if (scene.activeCamera.position.y <= WATER_LEVEL + 1) {
      scene.fogColor = colorfogwater
      scene.fogDensity = 0.04
    } else {
      scene.fogColor = colorfogAmbient
      scene.fogDensity = 0.00001
    }
  })
}

export default function initScene(engine, canvas) {
  const scene = new B.Scene(engine)

  scene.gravity = new B.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true

  initWater(scene)
  initLight(scene)
  initCamera(DIMENSIONS, CHUNK, canvas, scene)

  const ui = buildGUI(scene)
  const materials = buildMaterials(scene)
  const world = buildWorld(DIMENSIONS, CHUNK)
  const chunks = buildChunks(world, materials, DIMENSIONS, CHUNK, scene)

  initDraw(world, chunks, ui, canvas, scene)

  return scene
}
