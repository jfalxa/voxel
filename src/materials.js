import * as B from 'babylonjs'
import { BlockTypes } from './config'

export default scene => {
  const water = new B.StandardMaterial('water', scene)
  water.diffuseColor = new B.Color3(0, 0, 0.5)
  water.alpha = 0.5

  const dirt = new B.StandardMaterial('dirt', scene)
  dirt.diffuseColor = new B.Color3(0, 0.5, 0)

  const materials = {
    [BlockTypes.WATER]: water,
    [BlockTypes.DIRT]: dirt
  }

  scene.blockMaterials = materials

  return materials
}
