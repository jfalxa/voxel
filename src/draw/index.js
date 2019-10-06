import * as BABYLON from 'babylonjs'

import { SIZE } from '../config/grid'
import { constrain } from '../utils/grid'
import buildCursor from './cursor'
import buildGrid from './grid'

const {
  POINTERDOWN,
  POINTERMOVE,
  POINTERUP,
  POINTERWHEEL
} = BABYLON.PointerEventTypes

const DRAW_NORMAL = new BABYLON.Vector3(0, 1, 0)

class Draw {
  constructor(scene, onChange) {
    this.state = {
      drawing: false,
      origin: null,
      deltaY: 0
    }

    this.onChange = onChange

    this.scene = scene
    this.scene.onPointerObservable.add(this.onPointer.bind(this))

    this.cursor = buildCursor(scene)
    this.grid = buildGrid(scene)
  }

  reset() {
    this.state.drawing = false
    this.state.origin = null
    this.state.deltaY = 0

    this.plane = null

    this.cursor.scaling.x = 1
    this.cursor.scaling.y = 1
    this.cursor.scaling.z = 1
    this.cursor.isVisible = false
  }

  lockControls(locked) {
    if (locked) {
      this.scene.activeCamera.detachControl()
      this.cursor.isVisible = true
    } else {
      this.scene.activeCamera.attachControl()
      this.reset()
    }
  }

  getCursorPosition() {
    const { pointerX, pointerY } = this.scene
    const info = this.scene.pick(pointerX, pointerY)
    return info.hit ? constrain(info.pickedPoint) : null
  }

  getPlanePosition() {
    if (!this.plane) return null

    const { pointerX, pointerY } = this.scene

    const ray = this.scene.createPickingRay(pointerX, pointerY)
    const distance = ray.intersectsPlane(this.plane)
    const position = ray.origin.addInPlace(ray.direction.scaleInPlace(distance))

    return constrain(position, true)
  }

  onPointerDown() {
    if (!this.state.origin) return

    this.state.drawing = true

    this.plane = BABYLON.Plane.FromPositionAndNormal(
      this.state.origin.clone(),
      DRAW_NORMAL
    )

    this.grid.position.y = this.state.origin.y
  }

  onPointerMove() {
    if (this.state.drawing) {
      const position = this.getPlanePosition()

      if (position) {
        const origin = this.state.origin

        const delta = position.subtract(origin)

        this.cursor.position.x = delta.x >= 0 ? origin.x : position.x
        this.cursor.position.z = delta.z >= 0 ? origin.z : position.z

        this.cursor.scaling.x = delta.x >= 0 ? delta.x : -delta.x + 1
        this.cursor.scaling.z = delta.z >= 0 ? delta.z : -delta.z + 1

        this.cursor.position.x += 0.5
        this.cursor.position.z += 0.5

        this.cursor.scaling.x = Math.max(1, this.cursor.scaling.x)
        this.cursor.scaling.z = Math.max(1, this.cursor.scaling.z)
      }
    } else {
      const position = this.getCursorPosition()

      if (position) {
        this.state.origin = position.clone()
        this.cursor.position = position.addInPlaceFromFloats(0.5, 0.5, 0.5)
      }
    }
  }

  onPointerUp(info) {
    const origin = this.cursor.position.subtractFromFloats(0.5, 0.5, 0.5)
    const dimensions = this.cursor.scaling.clone()

    if (this.state.drawing) {
      this.onChange({
        origin,
        dimensions,
        clear: info.event.which === 3
      })
    }

    this.reset()
  }

  onPointerWheel(info) {
    if (info.event.shiftKey) {
      this.grid.position.y -= Math.sign(info.event.deltaY)
      this.grid.position.y = Math.max(0, Math.min(this.grid.position.y, SIZE - 1)) // prettier-ignore
    }

    if (!this.state.drawing) return

    this.state.deltaY -= Math.sign(info.event.deltaY)

    // prettier-ignore
    this.state.deltaY = this.state.deltaY > 0
      ? Math.min(SIZE - this.state.origin.y - 1, this.state.deltaY)
      : Math.max(-this.state.origin.y, this.state.deltaY)

    // prettier-ignore
    this.cursor.position.y = this.state.deltaY > 0  
      ? this.state.origin.y 
      : this.state.origin.y + this.state.deltaY

    this.cursor.position.y += 0.5
    this.cursor.scaling.y = Math.abs(this.state.deltaY) + 1
  }

  onPointer(info) {
    this.lockControls(info.event.shiftKey)

    switch (info.type) {
      case POINTERDOWN:
        return this.onPointerDown(info)
      case POINTERMOVE:
        return this.onPointerMove(info)
      case POINTERUP:
        return this.onPointerUp(info)
      case POINTERWHEEL:
        return this.onPointerWheel(info)
    }
  }
}

export default function initDraw(scene, onChange) {
  return new Draw(scene, onChange)
}
