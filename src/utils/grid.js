import { Vector3 } from '@babylonjs/core'
import { SIZE } from '../config/grid'

const MIN = new Vector3.Zero()
const MAX = new Vector3(SIZE - 1, SIZE - 1, SIZE - 1)
const MAX_DIM = new Vector3(SIZE, SIZE, SIZE)

export function snap(vec3) {
  return new BABYLON.Vector3(
    Math.floor(vec3.x),
    Math.floor(vec3.y),
    Math.floor(vec3.z)
  )
}

export function constrain(position, isDimensions) {
  const snapped = snap(position)
  const max = isDimensions ? MAX_DIM : MAX

  return Vector3.Clamp(snapped, MIN, max)
}
