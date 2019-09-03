import * as B from 'babylonjs'

import water from '../../assets/textures/blocks/water.png'
import stone from '../../assets/textures/blocks/stone.png'
import sand from '../../assets/textures/blocks/sand.png'
import dirt from '../../assets/textures/blocks/dirt.png'
import grass from '../../assets/textures/blocks/grass_top.png'

let i = 0

export const AIR = i++
export const WATER = i++
export const STONE = i++
export const SAND = i++
export const DIRT = i++
export const GRASS = i++

export const BlockSettings = {
  [WATER]: {
    texture: water,

    options: {
      alpha: 0.5,
      specularColor: new B.Color3(0, 0, 1)
    },

    meshOptions: {
      isPickable: false,
      checkCollisions: false
    }
  },

  [STONE]: {
    texture: stone
  },

  [SAND]: {
    texture: sand
  },

  [DIRT]: {
    texture: dirt
  },

  [GRASS]: {
    texture: grass
  }
}
