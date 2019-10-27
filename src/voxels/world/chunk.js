export default class Chunk {
  /**
   * @param {object} world
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   */
  constructor(world, x, z, width, height, depth) {
    this.dirty = false
    this.world = world
    this.x = x
    this.z = z
    this.width = width
    this.height = height
    this.depth = depth
    this.dimensions = [width, height, depth]
    this.data = new Int16Array(width * height * depth)
  }

  index(x, y, z) {
    return x + this.width * (y + this.height * z)
  }

  has(x, y, z) {
    const validX = 0 <= x && x < this.width
    const validY = 0 <= y && y < this.height
    const validZ = 0 <= z && z < this.depth

    return validX && validY && validZ
  }

  // peek outside the chunk
  peek(x, y, z) {
    if (this.has(x, y, z)) return this.get(x, y, z)

    const wx = this.x - Math.floor(this.width / 2) + x
    const wz = this.z - Math.floor(this.depth / 2) + z

    return this.world.get(wx, y, wz)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   *
   * @returns {number}
   */
  get(x, y, z) {
    return this.has(x, y, z) ? this.data[this.index(x, y, z)] : null
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} value
   */
  set(x, y, z, value) {
    if (this.has(x, y, z)) {
      this.data[this.index(x, y, z)] = value
      this.dirty = true
    }
  }
}
