import * as B from 'babylonjs'

import water from '../assets/textures/blocks/water.png'
import stone from '../assets/textures/blocks/stone.png'
import sand from '../assets/textures/blocks/sand.png'
import dirt from '../assets/textures/blocks/dirt.png'
import grassSide from '../assets/textures/blocks/grass_side.png'
import grassTop from '../assets/textures/blocks/grass_top.png'

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
    texture: grassTop,
    textures: [grassSide, [grassTop, dirt], grassSide]
  }
}

function createMaterial(url, options = {}, scene) {
  const material = new B.StandardMaterial('block', scene)
  const texture = new B.Texture(url, scene, false, true, B.Texture.NEAREST_SAMPLINGMODE) // prettier-ignore

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

export default function initBlockTypes(scene) {
  scene.blockAtlas = {}

  for (const type in BlockSettings) {
    const { texture, textures, options } = BlockSettings[type]

    scene.blockAtlas[type] = {}

    if (texture) {
      scene.blockAtlas[type].material = createMaterial(texture, options, scene)
    }

    if (textures) {
      scene.blockAtlas[type].materials = textures.map(url =>
        Array.isArray(url)
          ? url.map(u => createMaterial(u, options, scene))
          : createMaterial(url, options, scene)
      )
    }
  }
}
