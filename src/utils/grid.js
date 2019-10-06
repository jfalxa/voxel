import { SIZE } from '../config/grid'

export function snap(vec3) {
  return new BABYLON.Vector3(
    Math.round(vec3.x),
    Math.round(vec3.y),
    Math.round(vec3.z)
  )
}

export function constrain(position, isDimensions) {
  const max = isDimensions ? SIZE : SIZE - 1

  return snap(position)
    .maximizeInPlaceFromFloats(0, 0, 0)
    .minimizeInPlaceFromFloats(max, max, max)
}
