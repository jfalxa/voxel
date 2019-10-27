import Chunk from './chunk'

// to simulate infinite terrain, we create a virtual 2D grid
// its size will be the biggest number allowed so we can store as many chunks as possible
const MAX_SIZE = Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER))

export default class World {
  constructor(chunkWidth, chunkHeight, chunkDepth) {
    this.chunks = {}

    this.chunkWidth = chunkWidth
    this.chunkHeight = chunkHeight
    this.chunkDepth = chunkDepth
  }

  index(x, z) {
    return x * MAX_SIZE + z
  }

  computeChunkCenter(x, z) {
    // translate coordinates by half a chunk to match chunk center
    let cx = x + this.chunkWidth / 2
    let cz = z + this.chunkDepth / 2

    // remove the extra space to get closer to the center
    cx -= cx % this.chunkWidth
    cz -= cz % this.chunkDepth

    // and floor the values to actually get the center
    cx = cx | 0
    cz = cz | 0

    return [cx, cz]
  }

  computeChunkPosition(chunk, x, z) {
    const cx = x - chunk.x + this.chunkWidth / 2
    const cz = z - chunk.z + this.chunkDepth / 2

    return [cx, cz]
  }

  initChunkAt(x, z) {
    const center = this.computeChunkCenter(x, z)
    const index = this.index(center[0], center[1])

    if (!this.chunks[index]) {
      this.chunks[index] = new Chunk(
        this,
        center[0],
        center[1],
        this.chunkWidth,
        this.chunkHeight,
        this.chunkDepth
      )
    }

    return this.chunks[index]
  }

  getChunkAt(x, z) {
    const center = this.computeChunkCenter(x, z)
    const index = this.index(center[0], center[1])

    return this.chunks[index]
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   *
   * @returns {number}
   */
  get(x, y, z) {
    const chunk = this.getChunkAt(x, z)

    if (!chunk) return 0

    const position = this.computeChunkPosition(chunk, x, z)
    return chunk.get(position[0], y, position[1])
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} value
   */
  set(x, y, z, value) {
    const chunk = this.initChunkAt(x, z)
    const position = this.computeChunkPosition(chunk, x, z)

    chunk.set(position[0], y, position[1], value)
  }

  fill(position, dimensions, value) {
    for (let x = position.x; x < position.x + dimensions.x; x++)
      for (let y = position.y; y < position.y + dimensions.y; y++)
        for (let z = position.z; z < position.z + dimensions.z; z++) {
          this.set(x, y, z, value)
        }
  }
}
