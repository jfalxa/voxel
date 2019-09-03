import * as B from 'babylonjs'
import { BlockSettings } from '../world/block-types'

const DEFAULT_OPTIONS = {
  specularColor: new B.Color3.Black()
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

export default function buildMaterials(scene) {
  const materials = {}

  for (const type in BlockSettings) {
    materials[type] = createMaterial(BlockSettings[type], scene)
  }

  return materials
}
