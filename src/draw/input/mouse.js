import * as BABYLON from 'babylonjs'

import { Draw } from '../'
import { constrain } from '../../utils/grid'

const {
  POINTERDOWN,
  POINTERMOVE,
  POINTERUP,
  POINTERWHEEL
} = BABYLON.PointerEventTypes

const UP = new BABYLON.Vector3.Up()

export default class MouseInput {
  /**
   * @param {Draw} draw
   */
  constructor(draw) {
    this.disabled = false
    this.draw = draw

    this.draw.scene.onPointerObservable.add(this.onPointer.bind(this))
  }

  getCursorPosition() {
    const { pointerX, pointerY } = this.draw.scene
    const info = this.draw.scene.pick(pointerX, pointerY)
    return info.hit ? constrain(info.pickedPoint, false, true) : null
  }

  getPlanePosition() {
    if (!this.plane) return null

    const scene = this.draw.scene

    const ray = scene.createPickingRay(scene.pointerX, scene.pointerY)
    const distance = ray.intersectsPlane(this.plane)
    const position = ray.origin.addInPlace(ray.direction.scaleInPlace(distance))

    return constrain(position, true, true)
  }

  onPointerDown() {
    const state = this.draw.state

    if (!state.origin) return

    const keyboard = this.draw.keyboard
    keyboard.disabled = true

    this.plane = BABYLON.Plane.FromPositionAndNormal(state.origin, UP)

    this.draw.toggleScaling(true)
    this.draw.update()
  }

  onPointerMove() {
    const state = this.draw.state

    if (state.target) {
      state.target = this.getPlanePosition()
    } else if (state.origin) {
      state.origin = this.getCursorPosition() || state.origin
    }

    this.draw.update()
  }

  onPointerUp(event) {
    if (this.draw.state.origin) {
      this.plane = null
      this.draw.apply(event.which === 3 ? 0 : 1)
    }
  }

  onPointerWheel(event) {
    const state = this.draw.state
    const position = state.target ? 'target' : state.origin ? 'origin' : null

    if (position) {
      state[position].y -= Math.sign(event.deltaY)
      state[position] = constrain(state[position])

      this.draw.update()
    }
  }

  onPointer(info) {
    if (this.disabled || !this.draw.locked(info.event.shiftKey)) return

    if (!this.draw.state.origin) {
      this.draw.init(this.getCursorPosition())
    }

    switch (info.type) {
      case POINTERDOWN:
        return this.onPointerDown(info.event)
      case POINTERMOVE:
        return this.onPointerMove(info.event)
      case POINTERUP:
        return this.onPointerUp(info.event)
      case POINTERWHEEL:
        return this.onPointerWheel(info.event)
    }
  }
}
