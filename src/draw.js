import * as B from 'babylonjs'

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

function getPlanePosition(scene, plane) {
  if (!plane) return null

  const ray = scene.createPickingRay(scene.pointerX, scene.pointerY)
  const distance = ray.intersectsPlane(plane)
  return snap(ray.origin.addInPlace(ray.direction.scaleInPlace(distance)))
}

function buildCursor(scene) {
  var mat = new B.StandardMaterial('', scene)
  mat.diffuseColor = new B.Color3(1, 0, 0)
  mat.wireframe = true

  const cursor = B.MeshBuilder.CreateBox('cursor', { size: 1 }, scene)
  cursor.setPivotPoint(new B.Vector3(-0.5, -0.5, -0.5))
  cursor.isPickable = false
  cursor.material = mat

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

function listenToMouse(scene, state) {
  function pointerDown(info, state) {
    state.drawing = true

    state.plane = B.Plane.FromPositionAndNormal(
      state.origin.clone(),
      DRAW_NORMAL
    )
  }

  function pointerMove(info, state) {
    if (state.drawing) {
      const position = getPlanePosition(scene, state.plane)

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
  }

  function pointerUp(info, state) {
    const result = state.cursor.clone()
    result.material = null
    result.isPickable = true

    resetDraw(state)
  }

  function pointerWheel(info, state) {
    if (!state.drawing) return

    state.deltaY -= Math.sign(info.event.deltaY)

    state.cursor.scaling.y = state.deltaY > 0 ? state.deltaY : -state.deltaY + 1
    state.cursor.position.y = state.deltaY > 0 ? state.origin.y :  state.origin.y + state.deltaY // prettier-ignore
  }

  scene.onPointerObservable.add(info => {
    if (!info.event.shiftKey) {
      scene.activeCamera.attachControl()
      return resetDraw(state)
    }

    state.cursor.isVisible = true
    scene.activeCamera.detachControl()

    switch (info.type) {
      case POINTERDOWN:
        return pointerDown(info, state)
      case POINTERMOVE:
        return pointerMove(info, state)
      case POINTERUP:
        return pointerUp(info, state)
      case POINTERWHEEL:
        return pointerWheel(info, state)
    }
  })
}

export default function drawTool(scene) {
  const state = {
    drawing: false,
    origin: null,
    plane: null,
    deltaY: 0,
    cursor: buildCursor(scene)
  }

  listenToMouse(scene, state)
}
