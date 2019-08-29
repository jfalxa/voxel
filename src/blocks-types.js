import * as B from 'babylonjs'
import waterTexture from '../assets/textures/blocks/water.png'
import dirtTexture from '../assets/textures/blocks/dirt.png'
import sandTexture from '../assets/textures/blocks/sand.png'

export const AIR = 0
export const WATER = 1
export const DIRT = 2
export const STONE = 4

function createTexture(path, scene) {
  const texture = new BABYLON.Texture(path, scene, false, true, BABYLON.Texture.NEAREST_SAMPLINGMODE) // prettier-ignore
  texture.anisotropicFilteringLevel = 1
  return texture
}

function initWater(scene) {
  const water = new B.StandardMaterial('water', scene)
  water.diffuseTexture = createTexture(waterTexture, scene)
  water.alpha = 0.5

  return mesh => {
    mesh.material = water
    mesh.checkCollisions = false
    mesh.isPickable = false
  }
}

function initDirt(scene) {
  const dirt = new B.StandardMaterial('dirt', scene)
  dirt.diffuseTexture = createTexture(dirtTexture, scene)

  return mesh => {
    mesh.material = dirt
    mesh.checkCollisions = true
  }
}

function initSand(scene) {
  const sand = new B.StandardMaterial('sand', scene)
  sand.diffuseTexture = createTexture(sandTexture, scene)

  return mesh => {
    mesh.material = sand
    mesh.checkCollisions = true
  }
}

export default function initBlockTypes(scene) {
  scene.blockMaterials = {
    [WATER]: initWater(scene),
    [DIRT]: initDirt(scene),
    [SAND]: initSand(scene),
    [STONE]: initStone(scene)
  }
}
