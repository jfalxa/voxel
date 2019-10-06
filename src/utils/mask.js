export default class Mask {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width
    this.height = height

    this.data = new Int8Array(width * height)
  }

  index(x, y) {
    return x + this.width * y
  }

  /**
   * @param {number} x
   * @param {number} y
   *
   * @returns {number}
   */
  get(x, y) {
    return this.data[this.index(x, y)]
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} value
   */
  set(x, y, value) {
    this.data[this.index(x, y)] = value
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} value
   */
  fill(x, y, width, height, value) {
    for (let i = x; i < x + width; i++)
      for (let j = y; j < y + height; j++) {
        this.set(i, j, value)
      }
  }

  /**
   * @param {number} fromX
   * @param {number} fromY
   */
  next(fromX = 0, fromY = 0) {
    const fromIndex = this.index(fromX, fromY)

    for (let i = fromIndex; i < this.data.length; i++) {
      if (this.data[i] !== 0) {
        const x = i % this.width
        const y = Math.floor(i / this.width)

        return [x, y]
      }
    }
  }
}
