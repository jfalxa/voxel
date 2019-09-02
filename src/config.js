export const DIMENSIONS = [4, 1, 4]
export const CHUNK = [16, 64, 16]

export const WIDTH = DIMENSIONS[0] * CHUNK[0]
export const HEIGHT = DIMENSIONS[1] * CHUNK[1]
export const DEPTH = DIMENSIONS[2] * CHUNK[2]

export const WATER_LEVEL = Math.floor(HEIGHT / 4)

export const ORTHOGONAL_MODE = true
