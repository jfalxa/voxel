export default class Mat3 {
  constructor(w, h, d, TypedArray) {
    this.w = w
    this.h = h
    this.d = d

    this.data = new TypedArray(w * h * d)
  }

  index(x, y, z) {
    return x + this.w * (y + this.h * z)
  }

  get(x, y, z) {
    return this.data[this.index(x, y, z)]
  }

  set(x, y, z, value) {
    this.data[this.index(x, y, z)] = value
  }
}
