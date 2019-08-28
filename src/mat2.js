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

  first() {
    const index = this.data.findIndex(Boolean)

    if (index === -1) return

    const x = index % this.w
    const y = Math.floor(index / this.w)

    return [x, y]
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
