import * as BABYLON from '@babylonjs/core'

export default function buildCursor(scene) {
  var mat = new BABYLON.StandardMaterial('', scene)
  mat.diffuseColor = new BABYLON.Color3(1, 0, 0)
  mat.alpha = 0.5

  const cursor = BABYLON.MeshBuilder.CreateBox('cursor', { size: 1 }, scene)
  cursor.isPickable = false
  cursor.material = mat

  cursor.setPivotPoint(new BABYLON.Vector3(-0.5, -0.5, -0.5))

  return cursor
}
