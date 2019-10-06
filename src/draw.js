import * as BABYLON from 'babylonjs'
import { GridMaterial } from '@babylonjs/materials'

import * as Colors from './config/colors'
import { SIZE } from './config/grid'

const {
  POINTERDOWN,
  POINTERMOVE,
  POINTERUP,
  POINTERWHEEL
} = BABYLON.PointerEventTypes

const DRAW_NORMAL = new BABYLON.Vector3(0, 1, 0)

function snap(vec3) {
  return new BABYLON.Vector3(
    Math.round(vec3.x) + 0.5,
    Math.round(vec3.y) + 0.5,
    Math.round(vec3.z) + 0.5
  )
}

function buildCursor(scene) {
  var mat = new BABYLON.StandardMaterial('', scene)
  mat.diffuseColor = new BABYLON.Color3(1, 0, 0)
  mat.alpha = 0.5

  const cursor = BABYLON.MeshBuilder.CreateBox('cursor', { size: 1 }, scene)
  cursor.isPickable = false
  cursor.material = mat

  cursor.setPivotPoint(new BABYLON.Vector3(-0.5, -0.5, -0.5))

  return cursor
}

function buildGrid(scene) {
  const grid = BABYLON.MeshBuilder.CreateGround(
    'grid',
    {
      width: SIZE,
      height: SIZE
    },
    scene
  )

  grid.position.x = SIZE / 2
  grid.position.z = SIZE / 2

  grid.material = new GridMaterial('groundMaterial', scene)
  grid.material.opacity = 0.9
  grid.material.backFaceCulling = false
  grid.material.lineColor = Colors.Light1
  grid.material.majorUnitFrequency = 3
  grid.material.gridRatio = 1

  return grid
}

export default class DrawTool {
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

    this.grid.isVisible = false
  }

  lockControls(locked) {
    if (locked) {
      this.scene.activeCamera.detachControl()
      this.cursor.isVisible = true
      this.grid.isVisible = true
    } else {
      this.scene.activeCamera.attachControl()
      this.reset()
    }
  }

  getCursorPosition() {
    const { pointerX, pointerY } = this.scene
    const info = this.scene.pick(pointerX, pointerY)
    return info.hit ? snap(info.pickedPoint) : null
  }

  getPlanePosition() {
    if (!this.plane) return null

    const { pointerX, pointerY } = this.scene

    const ray = this.scene.createPickingRay(pointerX, pointerY)
    const distance = ray.intersectsPlane(this.plane)

    return snap(ray.origin.addInPlace(ray.direction.scaleInPlace(distance)))
  }

  onPointerDown() {
    if (!this.state.origin) return

    this.state.drawing = true

    this.plane = BABYLON.Plane.FromPositionAndNormal(
      this.state.origin.clone(),
      DRAW_NORMAL
    )

    this.grid.position.y = this.state.origin.y - 0.5
  }

  onPointerMove() {
    if (this.state.drawing) {
      const position = this.getPlanePosition()

      if (position) {
        const delta = position.subtract(this.state.origin)

        this.cursor.scaling.x = delta.x > 0 ? delta.x : -delta.x + 1
        this.cursor.scaling.z = delta.z > 0 ? delta.z : -delta.z + 1

        this.cursor.position.x = delta.x < 0 ? position.x : this.state.origin.x // prettier-ignore
        this.cursor.position.z = delta.z < 0 ? position.z : this.state.origin.z // prettier-ignore
      }
    } else {
      const position = this.getCursorPosition()

      if (position) {
        this.state.origin = position.clone()
        this.cursor.position = position.clone()
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
      this.grid.position.y = Math.max(0, Math.min(this.grid.position.y, 48))
    }

    if (!this.state.drawing) return

    this.state.deltaY -= Math.sign(info.event.deltaY)
    this.state.deltaY = Math.max(-this.state.origin.y + 0.5, this.state.deltaY)

    // prettier-ignore
    this.cursor.scaling.y = this.state.deltaY > 0 
      ? this.state.deltaY + 1
      : -this.state.deltaY + 1

    // prettier-ignore
    this.cursor.position.y = this.state.deltaY > 0  
      ? this.state.origin.y 
      : this.state.origin.y + this.state.deltaY
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
