export default class Mat2 {
  constructor(w, h, TypedArray) {
    this.w = w
    this.h = h

    this.data = new TypedArray(w * h)
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
}
