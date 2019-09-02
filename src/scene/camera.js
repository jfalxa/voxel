import * as B from 'babylonjs'
import { ORTHOGONAL_MODE } from '../config'

const ZOOM = 1
const ORTHO_ZOOM = 0.9

function buildIsometricCamera(dimensions, chunk, scene, ortho) {
  const size = new B.Vector3(
    dimensions[0] * chunk[0],
    dimensions[1] * chunk[1],
    dimensions[2] * chunk[2]
  )

  const target = size.scale(1 / 2)
  const pov = size.multiplyByFloats(-1, 1, -1).scale(ZOOM)
  pov.y = target.y

  const distance = B.Vector3.Distance(target, pov)
  pov.y += Math.atan(Math.sin(Math.PI / 3)) * distance

  const camera = new B.UniversalCamera('camera', pov, scene)

  if (ORTHOGONAL_MODE) {
    const offset = Math.max(size.x, size.y, size.z) * ORTHO_ZOOM

    camera.mode = B.Camera.ORTHOGRAPHIC_CAMERA
    camera.orthoLeft = -offset
    camera.orthoRight = offset
    camera.orthoTop = offset
    camera.orthoBottom = -offset
  }

  camera.setTarget(target)
  camera.inputs.removeMouse()

  return camera
}

export default function initCamera(dimensions, chunk, canvas, scene) {
  const camera = buildIsometricCamera(dimensions, chunk, scene)

  camera.attachControl(canvas, false)

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
