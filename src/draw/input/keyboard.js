import * as BABYLON from 'babylonjs'

import { Draw } from '../'
import { SIZE } from '../../config/grid'
import { constrain } from '../../utils/grid'

const { KEYDOWN, KEYUP } = BABYLON.KeyboardEventTypes

const UP = new BABYLON.Vector3.Up()
const DOWN = new BABYLON.Vector3.Down()
const FORWARD = new BABYLON.Vector3.Forward()

function normalize(vector) {
  const max = Math.max(Math.abs(vector.x), Math.abs(vector.z))
  return vector.scale(1 / 2 / max)
}

export default class KeyboardInput {
  /**
   * @param {Draw} draw
   */
  constructor(draw) {
    this.draw = draw
    this.disabled = false
    this.reference = null

    this.draw.scene.onKeyboardObservable.add(this.onKeyboard.bind(this))

    this.ref = new BABYLON.MeshBuilder.CreateSphere(
      'ref',
      { diameter: 1 },
      this.draw.scene
    )

    window.ref = this.ref
  }

  init() {
    this.draw.mouse.disabled = true

    if (!this.reference) {
      const origin = new BABYLON.Vector3(SIZE / 2, 0, SIZE / 2)
      this.reference = origin.addInPlaceFromFloats(0.5, 0, 0.5)
    }

    this.ref.position = this.reference

    this.draw.init(constrain(this.reference))
    this.draw.update()
  }

  move(delta) {
    const state = this.draw.state

    this.reference.addInPlace(delta)
    const position = constrain(this.reference)

    if (state.target) {
      state.target = position
    } else if (state.origin) {
      state.origin = position
    }
  }

  getDirection() {
    const scene = this.draw.scene

    const vertical = scene.activeCamera.getDirection(FORWARD)
    const horizontal = BABYLON.Vector3.Cross(vertical, UP).negate()

    vertical.y = 0
    horizontal.y = 0

    return {
      vertical: normalize(vertical),
      horizontal: normalize(horizontal)
    }
  }

  onKeyboardDraw(event) {
    if (!this.draw.state.origin) return

    const direction = this.getDirection()

    switch (event.code) {
      case 'ArrowUp':
        // prettier-ignore
        return event.shiftKey
          ? this.move(UP)
          : this.move(direction.vertical)

      case 'ArrowDown':
        // prettier-ignore
        return event.shiftKey
          ? this.move(DOWN)
          : this.move(direction.vertical.negate())

      case 'ArrowRight':
        return this.move(direction.horizontal)

      case 'ArrowLeft':
        return this.move(direction.horizontal.negate())
    }
  }

  onKeyboardAction(event) {
    const state = this.draw.state

    if (!state.origin) {
      // prettier-ignore
      return event.code === 'Enter'
        ? this.init()
        : null
    }

    switch (event.code) {
      case 'Enter':
        return this.draw.apply(1)

      case 'Space':
        return this.draw.toggleScaling()

      case 'Delete':
        return this.draw.apply(0)

      case 'Escape':
        return this.draw.reset()
    }
  }

  onKeyboardDown(event) {
    this.onKeyboardDraw(event)
    this.onKeyboardAction(event)

    this.draw.update()
  }

  onKeyboardUp(event) {}

  onKeyboard(info) {
    if (this.disabled) return

    this.draw.locked(this.draw.state.origin)

    switch (info.type) {
      case KEYDOWN:
        return this.onKeyboardDown(info.event)
      case KEYUP:
        return this.onKeyboardUp(info.event)
    }
  }
}
