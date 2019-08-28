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

function listenToMouse(scene, state) {
  const shift = new B.Vector3(
    scene.world.dimensions[0] / 2 - 0.5,
    -0.5,
    scene.world.dimensions[2] / 2 - 0.5
  )

  function updateUI(origin, dimensions) {
    if (!origin) {
      return (scene.infoText.text = '')
    }

    const { x, y, z } = origin.add(shift)
    const { x: w, y: h, z: d } = dimensions

    scene.infoText.text = `(${x}, ${y}, ${z}) (${w}, ${h}, ${d})`
  }

  function pointerDown(info, state) {
    if (!state.origin) return

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

    updateUI(state.cursor.position, state.cursor.scaling)
  }

  function pointerUp(info, state) {
    const [width, , depth] = scene.world.dimensions

    const delta = new B.Vector3(width / 2 - 0.5, -0.5, depth / 2 - 0.5)
    const origin = state.cursor.position.add(delta)
    const dimensions = state.cursor.scaling.clone()

    const shouldCarve = info.event.which === 3
    scene.world.fill(origin, dimensions, shouldCarve ? -1 : 1)

    scene.chunks = scene.chunks.map(chunk =>
      state.cursor.intersectsMesh(chunk.intersectionBox)
        ? chunk.rebuild()
        : chunk
    )

    updateUI()
    resetDraw(state)
  }

  function pointerWheel(info, state) {
    if (!state.drawing) return

    state.deltaY -= Math.sign(info.event.deltaY)

    state.cursor.scaling.y = state.deltaY > 0 ? state.deltaY : -state.deltaY + 1
    state.cursor.position.y = state.deltaY > 0 ? state.origin.y :  state.origin.y + state.deltaY // prettier-ignore

    updateUI(state.cursor.position, state.cursor.scaling)
  }

  scene.onPointerObservable.add(info => {
    if (!info.event.shiftKey) {
      scene.activeCamera.attachControl(scene.activeCamera.canvas)
      updateUI()
      return resetDraw(state)
    }

    state.cursor.isVisible = true
    scene.activeCamera.detachControl(scene.activeCamera.canvas)

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
