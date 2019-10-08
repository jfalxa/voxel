import { Vector3 } from '@babylonjs/core'
import { SIZE } from '../config/grid'

const MIN = new Vector3.Zero()
const MAX = new Vector3(SIZE - 1, SIZE - 1, SIZE - 1)
const MAX_DIM = new Vector3(SIZE, SIZE, SIZE)

export function snap(vec3, isRound) {
  const predicate = isRound ? Math.round : Math.floor

  return new BABYLON.Vector3(
    predicate(vec3.x),
    predicate(vec3.y),
    predicate(vec3.z)
  )
}

export function constrain(position, isDimensions, isRound) {
  const snapped = snap(position, isRound)
  const max = isDimensions ? MAX_DIM : MAX

  return Vector3.Clamp(snapped, MIN, max)
}
