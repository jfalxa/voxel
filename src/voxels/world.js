import Chunk from './chunk'

// to simulate infinite terrain, we create a virtual 2D grid
// its size will be the biggest number allowed so we can store as many chunks as possible
const MAX_SIZE = Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER))

const CHUNK_HEIGHT = 128

export default class World {
  constructor(chunkWidth, chunkDepth) {
    this.chunks = {}

    this.chunkWidth = chunkWidth
    this.chunkHeight = CHUNK_HEIGHT
    this.chunkDepth = chunkDepth
  }

  createChunk(x, z) {
    const chunkCenter = this.getChunkCenter(x, z)
    const index = this.getChunkIndex(chunkCenter[0], chunkCenter[1])

    this.chunks[index] = new Chunk(
      this,
      chunkCenter[0],
      chunkCenter[1],
      this.chunkWidth,
      this.chunkHeight,
      this.chunkDepth
    )

    return this.chunks[index]
  }

  getChunkCenter(x, z) {
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

  getChunkIndex(x, z) {
    return x * MAX_SIZE + z
  }

  computeChunkParams(x, y, z) {
    const chunkCenter = this.getChunkCenter(x, z)
    const index = this.getChunkIndex(chunkCenter[0], chunkCenter[1])

    const chunk = this.chunks[index]

    // find the coordinates inside the chunk
    const cx = x - chunkCenter[0] + this.chunkWidth / 2
    const cz = z - chunkCenter[1] + this.chunkDepth / 2

    return [chunk, [cx, cz]]
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   *
   * @returns {number}
   */
  get(x, y, z) {
    const params = this.computeChunkParams(x, y, z)

    if (!params[0]) return 0

    const chunk = params[0]
    const cx = params[1][0]
    const cz = params[1][1]

    return chunk.get(cx, y, cz)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} value
   */
  set(x, y, z, value) {
    const params = this.computeChunkParams(x, y, z)

    if (!params[0]) {
      params[0] = this.createChunk(x, z)
    }

    const chunk = params[0]
    const cx = params[1][0]
    const cz = params[1][1]

    chunk.set(cx, y, cz, value)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @param {number} value
   */
  fill(x, y, z, width, height, depth, value) {
    for (let i = x; i < x + width; i++)
      for (let j = y; j < y + height; j++)
        for (let k = z; k < z + depth; k++) {
          this.set(i, j, k, value)
        }
  }
}
