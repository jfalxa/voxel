import * as B from 'babylonjs'
import * as BlockTypes from '../voxel/block-types'

const {
  POINTERDOWN,
  POINTERMOVE,
  POINTERUP,
  POINTERWHEEL
} = B.PointerEventTypes

const DRAW_NORMAL = new B.Vector3(0, 1, 0)

function snap(vec3) {
  return new B.Vector3(
    Math.round(vec3.x) + 0.5,
    Math.round(vec3.y) + 0.5,
    Math.round(vec3.z) + 0.5
  )
}

function getCursorPosition(scene) {
  const pos = scene.pick(scene.pointerX, scene.pointerY)
  return pos.hit ? snap(pos.pickedPoint) : null
}

function getPlanePosition(plane, scene) {
  if (!plane) return null

  const ray = scene.createPickingRay(scene.pointerX, scene.pointerY)
  const distance = ray.intersectsPlane(plane)

  return snap(ray.origin.addInPlace(ray.direction.scaleInPlace(distance)))
}

function buildCursor(scene) {
  var mat = new B.StandardMaterial('', scene)
  mat.diffuseColor = new B.Color3(1, 0, 0)
  mat.alpha = 0.5

  const cursor = B.MeshBuilder.CreateBox('cursor', { size: 1 }, scene)
  cursor.isPickable = false
  cursor.material = mat

  cursor.setPivotPoint(new B.Vector3(-0.5, -0.5, -0.5))

  return cursor
}

function resetDraw(state) {
  state.drawing = false
  state.origin = null
  state.plane = null
  state.deltaY = 0

  state.cursor.scaling.x = 1
  state.cursor.scaling.y = 1
  state.cursor.scaling.z = 1
  state.cursor.isVisible = false
}

function listenToMouse(state, world, chunks, ui, canvas, scene) {
  function updateUI(origin, dimensions) {
    if (!origin) {
      return (ui.info.text = '')
    }

    const { x, y, z } = origin.subtractFromFloats(0.5, 0.5, 0.5)
    const { x: w, y: h, z: d } = dimensions

    ui.info.text = `(${x}, ${y}, ${z}) (${w}, ${h}, ${d})`
  }

  function pointerDown(state, info) {
    if (!state.origin) return

    state.drawing = true

    state.plane = B.Plane.FromPositionAndNormal(
      state.origin.clone(),
      DRAW_NORMAL
    )
  }

  function pointerMove(state) {
    if (state.drawing) {
      const position = getPlanePosition(state.plane, scene)

      if (position) {
        const delta = position.subtract(state.origin)

        state.cursor.scaling.x = delta.x > 0 ? delta.x : -delta.x + 1
        state.cursor.scaling.z = delta.z > 0 ? delta.z : -delta.z + 1

        state.cursor.position.x = delta.x < 0 ? position.x : state.origin.x
        state.cursor.position.z = delta.z < 0 ? position.z : state.origin.z
      }
    } else {
      const position = getCursorPosition(scene)

      if (position) {
        state.origin = position.clone()
        state.cursor.position = position.clone()
      }
    }

    updateUI(state.cursor.position, state.cursor.scaling)
  }

  function pointerUp(state, info) {
    const origin = state.cursor.position.subtractFromFloats(0.5, 0.5, 0.5)
    const dimensions = state.cursor.scaling.clone()

    const block = info.event.which === 3 ? BlockTypes.AIR : BlockTypes.DIRT
    world.fill(origin, dimensions, block)

    for (let i = 0; i < chunks.length; i++) {
      chunks[i] = state.cursor.intersectsMesh(chunks[i])
        ? chunks[i].rebuild()
        : chunks[i]
    }

    updateUI()
    resetDraw(state)
  }

  function pointerWheel(state, info) {
    if (!state.drawing) return

    state.deltaY -= Math.sign(info.event.deltaY)

    // prettier-ignore
    state.cursor.scaling.y = state.deltaY > 0 
      ? state.deltaY 
      : -state.deltaY + 1

    // prettier-ignore
    state.cursor.position.y = state.deltaY > 0  
      ? state.origin.y 
      : state.origin.y + state.deltaY

    updateUI(state.cursor.position, state.cursor.scaling)
  }

  function onPointer(info) {
    if (!info.event.shiftKey) {
      // scene.activeCamera.attachControl(canvas)
      updateUI()
      return resetDraw(state)
    }

    state.cursor.isVisible = true
    scene.activeCamera.detachControl(canvas)

    switch (info.type) {
      case POINTERDOWN:
        return pointerDown(state, info)
      case POINTERMOVE:
        return pointerMove(state, info)
      case POINTERUP:
        return pointerUp(state, info)
      case POINTERWHEEL:
        return pointerWheel(state, info)
    }
  }

  scene.onPointerObservable.add(onPointer)
}

export default function drawTool(world, chunks, ui, canvas, scene) {
  const state = {
    drawing: false,
    origin: null,
    plane: null,
    deltaY: 0,
    cursor: buildCursor(scene)
  }

  listenToMouse(state, world, chunks, ui, canvas, scene)
}
