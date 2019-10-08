import { Vector3 } from '@babylonjs/core'
import { SIZE } from '../config/grid'

const MIN = new Vector3.Zero()
const MAX = new Vector3(SIZE - 1, SIZE - 1, SIZE - 1)
const MAX_DIM = new Vector3(SIZE, SIZE, SIZE)

export function snap(vec3, size = 1, isRound = false) {
  const predicate = isRound ? Math.round : Math.floor

  return new BABYLON.Vector3(
    predicate(vec3.x - (vec3.x % size)),
    predicate(vec3.y - (vec3.y % size)),
    predicate(vec3.z - (vec3.z % size))
  )
}

export function constrain(position, size, isDimensions, isRound) {
  const snapped = snap(position, size, isRound)
  const max = isDimensions ? MAX_DIM : MAX

  return Vector3.Clamp(snapped, MIN, max)
}
