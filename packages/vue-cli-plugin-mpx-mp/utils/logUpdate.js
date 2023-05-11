const ansiEscapes = require('ansi-escapes')
const wrapAnsi = require('wrap-ansi')
const originalWrite = Symbol('webpackbarWrite')

module.exports = class LogUpdate {
  constructor () {
    this.prevLineCount = 0
    this.listening = false
    this.extraLines = ''
    this._onData = this._onData.bind(this)
    this._streams = [process.stdout, process.stderr]
  }

  render (lines) {
    this.listen()
    const wrappedLines = wrapAnsi(lines, this.columns, {
      trim: false,
      hard: true,
      wordWrap: false
    })
    const data = ansiEscapes.eraseLines(this.prevLineCount) + wrappedLines + '\n' + this.extraLines
    this.write(data)
    const _lines = data.split('\n')
    this.prevLineCount = _lines.length
  }

  get columns () {
    return (process.stderr.columns || 80) - 2
  }

  write (data) {
    const stream = process.stderr
    if (stream.write[originalWrite]) {
      stream.write[originalWrite].call(stream, data, 'utf-8')
    } else {
      stream.write(data, 'utf-8')
    }
  }

  clear () {
    this.done()
    this.write(ansiEscapes.eraseLines(this.prevLineCount))
  }

  done () {
    this.stopListen()
    this.prevLineCount = 0
    this.extraLines = ''
  }

  _onData (data) {
    const str = String(data)
    const lines = str.split('\n').length - 1
    if (lines > 0) {
      this.prevLineCount += lines
      this.extraLines += data
    }
  }

  listen () {
    if (this.listening) {
      return
    }
    for (const stream of this._streams) {
      if (stream.write[originalWrite]) {
        continue
      }
      const write = (data, ...args) => {
        if (!stream.write[originalWrite]) {
          return stream.write(data, ...args)
        }
        this._onData(data)
        return stream.write[originalWrite].call(stream, data, ...args)
      }
      write[originalWrite] = stream.write
      stream.write = write
    }
    this.listening = true
  }

  stopListen () {
    for (const stream of this._streams) {
      if (stream.write[originalWrite]) {
        stream.write = stream.write[originalWrite]
      }
    }
    this.listening = false
  }
}
