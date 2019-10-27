import Chrono from '../utils/chrono'
import World from './world'
import WorldMesh from './mesher'

const chrono = new Chrono()

class Voxels {
  constructor(width, height, depth, scene) {
    this.data = new World(width, height, depth)
    this.mesh = new WorldMesh(scene)
  }

  fill(position, dimensions, value) {
    chrono.start(`drawing ${dimensions.x * dimensions.y * dimensions.z} voxels`)

    this.data.fill(position, dimensions, value)

    chrono.step('filled')

    this.mesh.renderVoxels(this.data)

    chrono.stop('rendered')
  }
}

export default function createVoxels(width, height, depth, scene) {
  return new Voxels(width, height, depth, scene)
}
