import * as BABYLON from '@babylonjs/core'

export default function buildCursor(scene) {
  const cursor = BABYLON.MeshBuilder.CreateBox('cursor', { size: 1 }, scene)
  cursor.isVisible = false
  cursor.isPickable = false

  cursor.material = new BABYLON.StandardMaterial('', scene)
  cursor.material.diffuseColor = new BABYLON.Color3(1, 0, 0)
  cursor.material.alpha = 0.5

  cursor.setPivotPoint(new BABYLON.Vector3(-0.5, -0.5, -0.5))

  return cursor
}
