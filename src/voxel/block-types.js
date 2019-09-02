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

const DEFAULT_OPTIONS = {
  specularColor: new B.Color3.Black()
}

export const BlockSettings = {
  [WATER]: {
    texture: water,

    options: {
      alpha: 0.5,
      specularColor: new B.Color3(0, 0, 1),
      backFaceCulling: false
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

function createMaterial(settings, scene) {
  const material = new B.StandardMaterial('block', scene)
  const options = settings.options || {}

  const texture = new B.Texture(
    settings.texture,
    scene,
    false,
    true,
    B.Texture.NEAREST_SAMPLINGMODE
  )

  texture.anisotropicFilteringLevel = 1
  material.diffuseTexture = texture

  for (const prop in DEFAULT_OPTIONS) {
    material[prop] = DEFAULT_OPTIONS[prop]
  }

  for (const prop in options) {
    material[prop] = options[prop]
  }

  return material
}

export default function buildBlockTypes(scene) {
  const blockTypes = {}

  for (const type in BlockSettings) {
    blockTypes[type] = createMaterial(BlockSettings[type], scene)
  }

  return blockTypes
}
