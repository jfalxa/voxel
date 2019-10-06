export default class Voxels {
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   */
  constructor(width, height, depth) {
    this.width = width
    this.height = height
    this.depth = depth

    this.data = new Int16Array(width * height * depth)
  }

  index(x, y, z) {
    return x + this.width * (y + this.height * z)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   *
   * @returns {number}
   */
  get(x, y, z) {
    return this.data[this.index(x, y, z)]
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} value
   */
  set(x, y, z, value) {
    this.data[this.index(x, y, z)] = value
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
