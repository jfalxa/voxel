export default class Chunk {
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   */
  constructor(width, height, depth) {
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

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   *
   * @returns {number}
   */
  get(x, y, z) {
    return this.has(x, y, z) ? this.data[this.index(x, y, z)] : 0
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
    }
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
