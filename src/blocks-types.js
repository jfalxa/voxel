import * as B from 'babylonjs'

export const AIR = 0
export const WATER = 1
export const DIRT = 2

function initWater(scene) {
  const water = new B.StandardMaterial('water', scene)
  water.diffuseColor = new B.Color3(0, 0, 0.5)
  water.alpha = 0.5

  return mesh => {
    mesh.material = water
    mesh.checkCollisions = false
    mesh.isPickable = false
  }
}

function initDirt(scene) {
  const dirt = new B.StandardMaterial('dirt', scene)
  dirt.diffuseColor = new B.Color3(0, 0.5, 0)

  return mesh => {
    mesh.material = dirt
    mesh.checkCollisions = true
  }
}

export default function initBlockTypes(scene) {
  scene.blockMaterials = {
    [WATER]: initWater(scene),
    [DIRT]: initDirt(scene)
  }
}
