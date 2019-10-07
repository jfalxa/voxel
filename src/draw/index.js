import { Scene } from '@babylonjs/core'

import buildCursor from './cursor'
import buildGrid from './grid'
import MouseInput from './input/mouse'
import KeyboarInput from './input/keyboard'

export class Draw {
  /**
   * @param {Scene} scene
   * @param {(update) => void} onChange
   */
  constructor(scene, onChange) {
    this.state = {
      origin: null,
      target: null
    }

    this.onChange = onChange

    this.scene = scene
    this.mouse = new MouseInput(this)
    this.keyboard = new KeyboarInput(this)

    this.cursor = buildCursor(scene)
    this.grid = buildGrid(scene)
  }

  init(origin = this.state.origin) {
    this.state.origin = origin
    this.state.target = null
  }

  toggleScaling(scaling = !this.state.target) {
    this.state.target = scaling ? this.state.origin.clone() : null
  }

  reset() {
    this.state.origin = null
    this.state.target = null

    this.cursor.isVisible = false

    this.mouse.disabled = false
    this.keyboard.disabled = false

    this.update()
  }

  locked(locked) {
    const canvas = this.scene.getEngine().getRenderingCanvas()

    if (locked) {
      this.scene.activeCamera.detachControl(canvas)
      this.cursor.isVisible = true
    } else {
      this.scene.activeCamera.attachControl(canvas)
      this.reset()
    }

    return locked
  }

  box() {
    const position = new BABYLON.Vector3.Zero()
    const dimensions = new BABYLON.Vector3.One()

    const origin = this.state.origin
    const target = this.state.target || origin

    const delta = target.subtract(origin)

    position.x = delta.x >= 0 ? origin.x : target.x
    position.y = delta.y >= 0 ? origin.y : target.y
    position.z = delta.z >= 0 ? origin.z : target.z

    dimensions.x = delta.x >= 0 ? delta.x : -delta.x + 1
    dimensions.y = delta.y >= 0 ? delta.y : -delta.y + 1
    dimensions.z = delta.z >= 0 ? delta.z : -delta.z + 1

    dimensions.x = Math.max(1, dimensions.x)
    dimensions.y = Math.max(1, dimensions.y)
    dimensions.z = Math.max(1, dimensions.z)

    return { position, dimensions }
  }

  apply(value) {
    const box = this.box()

    this.onChange({
      position: box.position,
      dimensions: box.dimensions,
      value
    })

    this.reset()
  }

  update() {
    if (!this.state.origin) {
      this.cursor.isVisible = false
      this.cursor.scaling.setAll(1)
      this.cursor.position.setAll(0)
      return
    }

    const box = this.box()

    this.cursor.position.x = box.position.x + 0.5
    this.cursor.position.y = box.position.y + 0.5
    this.cursor.position.z = box.position.z + 0.5

    this.cursor.scaling.x = box.dimensions.x
    this.cursor.scaling.y = box.dimensions.y
    this.cursor.scaling.z = box.dimensions.z

    this.grid.position.y = box.position.y

    this.cursor.isVisible = true
  }
}

export default function initDraw(scene, onChange) {
  return new Draw(scene, onChange)
}
