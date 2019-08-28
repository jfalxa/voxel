import * as GUI from 'babylonjs-gui'

export default function initGUI(scene) {
  const gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI('gui')

  const info = new GUI.TextBlock()
  info.text = ''
  info.color = 'white'
  info.fontSize = 16
  info.paddingLeft = 8
  info.paddingBottom = 8
  info.width = '200px'
  info.height = '32px'

  info.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  info.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM

  gui.addControl(info)

  scene.infoText = info

  return gui
}
