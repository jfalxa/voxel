import * as B from 'babylonjs'
import { ORTHO_MODE, ORTHO_SIZE } from '../config'

function computeSettings(dimensions, chunk) {
  const size = new B.Vector3(
    dimensions[0] * chunk[0],
    dimensions[1] * chunk[1],
    dimensions[2] * chunk[2]
  )

  const target = size.scale(1 / 2)
  const position = size.multiplyByFloats(-1, 1, -1)
  position.y = target.y

  const distance = B.Vector3.Distance(target, position)
  position.y += distance / Math.sqrt(2)

  return { position, target, size }
}

function buildIsometricCamera(settings, canvas, scene) {
  const position = settings.position
  const target = settings.target

  const camera = new B.ArcRotateCamera('camera', 0, 0, 0, target, scene)
  camera.position = position
  camera.panningSensibility = 0
  camera.inertia = 0.5

  camera.lowerBetaLimit = camera.beta
  camera.upperBetaLimit = camera.beta

  const offset = Math.max(settings.size.x, settings.size.y, settings.size.z)
  const offsetX = (offset * canvas.width) / ORTHO_SIZE
  const offsetY = (offset * canvas.height) / ORTHO_SIZE

  camera.mode = B.Camera.ORTHOGRAPHIC_CAMERA
  camera.orthoLeft = -offsetX
  camera.orthoRight = offsetX
  camera.orthoTop = offsetY
  camera.orthoBottom = -offsetY

  camera.detachControl(canvas)

  scene.onKeyboardObservable.add(info => {
    const e = info.event

    if (event.type !== 'keydown') return

    if (e.key === 'a' || e.keyCode === 37) {
      camera.inertialAlphaOffset = Math.PI / 4
    } else if (e.key === 'd' || e.keyCode === 39) {
      camera.inertialAlphaOffset = -(Math.PI / 4)
    }
  })

  return camera
}

function buildFreeCamera(settings, canvas, scene) {
  const camera = new B.UniversalCamera('camera', settings.position, scene)

  camera.attachControl(canvas, false)
  camera.setTarget(settings.target)

  return camera
}

export default function initCamera(dimensions, chunk, canvas, scene) {
  const settings = computeSettings(dimensions, chunk)

  const camera = ORTHO_MODE
    ? buildIsometricCamera(settings, canvas, scene)
    : buildFreeCamera(settings, canvas, scene)

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
