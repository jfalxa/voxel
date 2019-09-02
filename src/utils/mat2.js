export default class Mat2 {
  constructor(w, h) {
    this.w = w
    this.h = h

    this.data = new Int8Array(w * h)
  }

  index(x, y) {
    return x + this.w * y
  }

  get(x, y) {
    return this.data[this.index(x, y)]
  }

  set(x, y, value) {
    this.data[this.index(x, y)] = value
  }

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

  print() {
    for (let i = 0; i < this.h; i++)
      console.log(this.data.slice(i * this.w, i * this.w + this.w).join(' '), i)
    console.log('')
  }
}
