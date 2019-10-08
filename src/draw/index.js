import { Scene } from '@babylonjs/core'

import { range } from '../ui'
import { constrain } from '../utils/grid'
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

    this.size = 1

    range.addEventListener('change', e => {
      this.size = parseInt(e.target.value, 10)
    })
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

  constrain(position, isDimension, isRound) {
    return constrain(position, this.size, isDimension, isRound)
  }

  box() {
    const position = new BABYLON.Vector3.Zero()
    const dimensions = new BABYLON.Vector3.Zero()

    const origin = this.state.origin
    const target = this.state.target || origin

    const delta = target.subtract(origin)

    position.x = delta.x >= 0 ? origin.x : target.x
    position.y = delta.y >= 0 ? origin.y : target.y
    position.z = delta.z >= 0 ? origin.z : target.z

    dimensions.x = delta.x >= 0 ? delta.x : -delta.x + this.size
    dimensions.y = delta.y >= 0 ? delta.y : -delta.y + this.size
    dimensions.z = delta.z >= 0 ? delta.z : -delta.z + this.size

    dimensions.x = Math.max(this.size, dimensions.x)
    dimensions.y = Math.max(this.size, dimensions.y)
    dimensions.z = Math.max(this.size, dimensions.z)

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

    this.grid.position.y = box.position.y + box.dimensions.y - this.size

    this.cursor.isVisible = true
  }
}

export default function initDraw(scene, onChange) {
  return new Draw(scene, onChange)
}
