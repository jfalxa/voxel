import * as B from 'babylonjs'

export default function(scene) {
  var mat = new B.StandardMaterial('', scene)
  mat.diffuseColor = new B.Color3(1, 0, 0)

  var gray = new B.StandardMaterial('', scene)
  gray.diffuseColor = new B.Color3(0.5, 0.5, 0.5)

  const box = B.MeshBuilder.CreateBox('box', { size: 1 }, scene)
  box.setPivotPoint(new B.Vector3(-0.5, 0.5, -0.5))
  box.isPickable = false
  box.material = mat

  function snap(vec3) {
    const p = {
      x: Math.round(vec3.x) + 0.5,
      y: Math.round(vec3.y) + 0.5,
      z: Math.round(vec3.z) + 0.5
    }

    return new B.Vector3(p.x, p.y, p.z)
  }

  function getPosition() {
    const pos = scene.pick(scene.pointerX, scene.pointerY)
    return pos.hit ? snap(pos.pickedPoint) : null
  }

  // Create pointerDragBehavior in the desired mode
  var pointerDragBehavior = new BABYLON.PointerDragBehavior({
    dragPlaneNormal: new BABYLON.Vector3(0, 1, 0)
  })

  // Use drag plane in world space
  pointerDragBehavior.moveAttached = false
  pointerDragBehavior.updateDragPlane = true

  let initial

  // Listen to drag events
  pointerDragBehavior.onDragStartObservable.add(event => {
    initial = box.position.clone()
  })

  pointerDragBehavior.onDragObservable.add(event => {
    const current = snap(event.dragPlanePoint)
    const delta = current.subtract(initial)

    box.scaling.x = delta.x
    box.scaling.z = delta.z
  })

  pointerDragBehavior.onDragEndObservable.add(() => {
    const stay = box.clone()
    stay.isPickable = true
    stay.material = gray

    box.scaling.x = 1
    box.scaling.y = 1
    box.scaling.z = 1
  })

  pointerDragBehavior.attach(box)

  scene.onPointerObservable.add(pointerInfo => {
    if (pointerInfo.event.shiftKey) return

    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERDOWN:
        pointerDown(pointerInfo)
        break
      case BABYLON.PointerEventTypes.POINTERMOVE:
        pointerMove(pointerInfo)
        break
      case BABYLON.PointerEventTypes.POINTERWHEEL:
        pointerWheel(pointerInfo)
        break
    }
  })

  function pointerDown(info) {
    box.scaling.x = 1
    box.scaling.y = 1
    box.scaling.z = 1

    const pos = getPosition()

    if (!pos) return

    box.position = pos

    pointerDragBehavior.startDrag(
      info.event.which,
      scene.activeCamera.getForwardRay(),
      getPosition()
    )
  }

  function pointerMove() {
    if (pointerDragBehavior.dragging) return

    const pos = getPosition()

    if (!pos) return

    box.position = pos
  }

  function pointerWheel(info) {
    box.scaling.y -= Math.sign(info.event.deltaY)
  }
}
