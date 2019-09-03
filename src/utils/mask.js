import Mat2 from './mat2'

export default class Mask extends Mat2 {
  next(fromX = 0, fromY = 0) {
    const fromIndex = this.index(fromX, fromY)

    for (let i = fromIndex; i < this.data.length; i++) {
      if (this.data[i] !== 0) {
        const x = i % this.w
        const y = Math.floor(i / this.w)

        return [x, y]
      }
    }
  }

  clear(x, y, w, h) {
    for (let i = x; i < x + w; i++)
      for (let j = y; j < y + h; j++) {
        this.set(i, j, 0)
      }
  }
}
