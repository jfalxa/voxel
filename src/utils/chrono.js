function formatTime(time) {
  return time.toFixed(6) + 'ms'
}

export default class Chrono {
  step(message = `step ${this.steps.length + 1}`) {
    this.steps.push([message, performance.now()])
  }

  start(message = 'start') {
    this.step(message)
  }

  stop(message = 'end') {
    this.step(message)
    this.print()
    this.steps = []
  }

  print() {
    const messages = this.steps.map(([message, time], i) => {
      if (i === 0) return message

      if (i === this.steps.length - 1) {
        const sinceStart = time - this.steps[0][1]
        return `${message} ${formatTime(sinceStart)}`
      }

      const last = Math.max(0, i - 1)
      const sinceLast = time - this.steps[last][1]

      return `${message} ${formatTime(sinceLast)}`
    })

    console.log(messages.join('\n'))
    console.log('')
  }
}
