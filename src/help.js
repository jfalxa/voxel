const message = document.createElement('div')

message.style.display = 'none'
message.style.position = 'absolute'
message.style.top = 0
message.style.left = 0
message.style.width = '100vw'
message.style.height = '100vh'
message.style.overflow = 'auto'
message.style.padding = '32px 64px'
message.style.boxSizing = 'border-box'
message.style.background = 'rgba(73, 78, 74, 0.8)'

message.innerHTML = `
<section id="mouse-controls">
  <h2>Mouse controls</h2>

  <h4>Free mode</h4>
  <ul>
    <li>click and drag mouse around to rotate the camera</li>
    <li>use Ctrl + drag mouse to move the camera</li>
    <li>use Scroll to manage zoom level</li>
  </ul>

  <h4>Draw mode</h4>
  <ul>
    <li>hold down Shift to start drawing</li>
    <li>move the mouse around to select a starting point</li>
    <li>use Scroll to adjust the vertical position of the starting point</li>
    <li>press LeftClick and drag the mouse to apply the covered area</li>
    <li>press RightClick and drag the mouse to remove the covered area</li>
    <li>while clicking, use Scroll to adjust the height of the area</li>
    <li>release Shift before releasing click to cancel the current operation</li>
  </ul>
</section>

<section id="keyboard-controls">
  <h2>Keyboard controls</h2>

  <h4>Free mode</h4>
  <ul>
    <li>click and drag mouse around to rotate the camera</li>
    <li>use Ctrl + drag mouse to move the camera</li>
  </ul>

  <h4>Draw mode</h4>
  <ul>
    <li>press Enter to start drawing</li>
    <li>move the starting point around with the arrow keys</li>
    <li>use Shift + ArrowUp/ArrowDown to adjust the vertical position</li>
    <li>press Space to toggle scaling mode (controls the opposite corner of the covered area)</li>
    <li>press Enter to apply the covered area </li>
    <li>press Delete to remove the covered area</li>
    <li>press Escape to cancel the current operation</li>
  </ul>
</section>
`

const button = document.createElement('button')
button.id = 'help'
button.innerHTML = '?'

button.style.position = 'absolute'
button.style.top = '16px'
button.style.left = '16px'

button.onclick = () => {
  const isDisplayed = message.style.display === 'block'
  button.innerHTML = isDisplayed ? '?' : 'X'
  message.style.display = isDisplayed ? 'none' : 'block'
}

document.body.appendChild(message)
document.body.appendChild(button)
