import Mat2 from './mat2'
import Mat3 from './mat3'

const DEFAULT_OPTIONS = {
  scale: 1.0,
  amplitude: 1.0,
  lacunarity: 2.0,
  octaves: 1,
  persistence: 0.5
}

function initOptions(options, dimensions) {
  for (const option in DEFAULT_OPTIONS) {
    if (typeof options[option] === 'undefined') {
      options[option] = DEFAULT_OPTIONS[option]
    }
  }

  return options
}

function computeOctaves(op) {
  const octaves = Array(op.octaves)

  for (let octave = 0; octave < op.octaves; octave++) {
    const freq = op.scale * Math.pow(op.lacunarity, octave)
    const ampl = op.amplitude * Math.pow(op.persistence, octave)

    octaves[octave] = [freq, ampl]
  }

  return octaves
}

function computeRatio(octaves) {
  return 2 - 1 / Math.pow(2, octaves - 1)
}

export function fractal2(width, height, noise, options) {
  const field = new Mat2(width, height, Float32Array)

  const op = initOptions(options)
  const octaves = computeOctaves(op)
  const ratio = computeRatio(op.octaves)

  for (let x = 0; x < width; x++)
    for (let y = 0; y < height; y++) {
      let value = 0.0

      for (let i = 0; i < op.octaves; i++) {
        const freq = octaves[i][0]
        const ampl = octaves[i][1]

        value += noise.noise2D(x * freq, y * freq) * ampl
      }

      field.set(x, y, value / ratio)
    }
  return field
}

export function fractal3(width, height, depth, noise, options) {
  const field = new Mat3(width, height, depth, Float32Array)

  const op = initOptions(options)
  const octaves = computeOctaves(op)
  const ratio = computeRatio(op.octaves)

  for (let x = 0; x < width; x++)
    for (let y = 0; y < height; y++)
      for (let z = 0; z < depth; z++) {
        let value = 0.0
        for (let i = 0; i < op.octaves; i++) {
          const freq = octaves[i][0]
          const ampl = octaves[i][1]

          value += noise.noise3D(x * freq, y * freq, z * freq) * ampl
        }

        field.set(x, y, z, value / ratio)
      }
  return field
}
