import * as BABYLON from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'

import { SIZE, FREQUENCY } from '../config/grid'
import * as Colors from '../config/colors'

export default function buildGrid(scene) {
  const grid = BABYLON.MeshBuilder.CreateGround(
    'grid',
    {
      width: SIZE,
      height: SIZE
    },
    scene
  )

  grid.position.x = SIZE / 2
  grid.position.z = SIZE / 2

  grid.material = new GridMaterial('grid-material', scene)
  grid.material.opacity = 0.9
  grid.material.backFaceCulling = false
  grid.material.lineColor = Colors.Light1
  grid.material.majorUnitFrequency = FREQUENCY
  grid.material.gridRatio = 1

  return grid
}
