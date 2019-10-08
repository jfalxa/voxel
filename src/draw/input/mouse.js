import * as BABYLON from 'babylonjs'

import { Draw } from '../'
import { CENTER } from '../../config/grid'

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

    if (!info.hit) return null

    if (info.pickedMesh.id === 'grid') {
      info.pickedPoint.y += 0.5
    }

    return this.draw.constrain(info.pickedPoint)
  }

  getPlanePosition() {
    const scene = this.draw.scene
    const state = this.draw.state

    const source = BABYLON.Vector3.Maximize(state.origin, state.target)
    const plane = BABYLON.Plane.FromPositionAndNormal(source, UP)

    const ray = scene.createPickingRay(scene.pointerX, scene.pointerY)
    const distance = ray.intersectsPlane(plane)
    const position = ray.origin.addInPlace(ray.direction.scaleInPlace(distance))

    position.y = state.target.y

    return this.draw.constrain(position, true)
  }

  onPointerDown() {
    const state = this.draw.state

    if (!state.origin) return

    const keyboard = this.draw.keyboard
    keyboard.disabled = true

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
      state[position].y -= Math.sign(event.deltaY) * this.draw.size
      state[position] = this.draw.constrain(state[position])
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
