import * as BABYLON from 'babylonjs'

function initLight(scene) {
  return new BABYLON.HemisphericLight(
    'light1',
    new BABYLON.Vector3(0, 1, 0),
    scene
  )
}

function initCamera(canvas, scene) {
  const position = new BABYLON.Vector3(-5, 5, -5)
  const target = new BABYLON.Vector3.Zero()

  const camera = new BABYLON.UniversalCamera('camera', position, scene)

  camera.attachControl(canvas, false)
  camera.setTarget(target)

  camera.minZ = 0

  camera.checkCollisions = true
  camera.ellipsoid = new BABYLON.Vector3(0.49, 1, 0.49)
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0)

  camera.keysUp.push(87)
  camera.keysRight.push(68)
  camera.keysDown.push(83)
  camera.keysLeft.push(65)

  return camera
}

export default function initScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine)

  scene.gravity = new BABYLON.Vector3(0, -0.9, 0)
  scene.collisionsEnabled = true

  initLight(scene)
  initCamera(canvas, scene)

  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    width: 50,
    height: 50
  })
  ground.material = new BABYLON.GridMaterial('groundMaterial', scene)

  return scene
}
