const { chalk } = require('@vue/cli-shared-utils')
const ansiEscapes = require('ansi-escapes')
const wrapAnsi = require('wrap-ansi')
const originalWrite = Symbol('webpackbarWrite')

class LogUpdate {
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
    const data =
      ansiEscapes.eraseLines(this.prevLineCount) +
      wrappedLines +
      '\n' +
      this.extraLines
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
    this.write(ansiEscapes.eraseLines(this.prevLineCount))
    this.prevLineCount = 0
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

const logUpdate = new LogUpdate()

const common = {
  pointerSmall: '›',
  bullet: '●'
}

const mainSymbols = {
  ...common,
  radioOff: '◯',
  tick: '✔',
  cross: '✖'
}

const fallbackSymbols = {
  ...common,
  tick: '√',
  radioOff: '( )',
  cross: '×'
}

function ellipsisLeft (str, n) {
  if (str.length <= n - 3) {
    return str
  }
  return `...${str.substr(str.length - n - 1)}`
}

function isUnicodeSupported () {
  if (process.platform !== 'win32') {
    return process.env.TERM !== 'linux' // Linux console (kernel)
  }

  return (
    Boolean(process.env.CI) ||
    Boolean(process.env.WT_SESSION) || // Windows Terminal
    process.env.ConEmuTask === '{cmd::Cmder}' || // ConEmu and cmder
    process.env.TERM_PROGRAM === 'vscode' ||
    process.env.TERM === 'xterm-256color' ||
    process.env.TERM === 'alacritty'
  )
}

const shouldUseMain = isUnicodeSupported()
const figures = shouldUseMain ? mainSymbols : fallbackSymbols

const { bullet, tick, cross, pointerSmall, radioOff } = figures
const BAR_LENGTH = 25
const BLOCK_CHAR = '\u2588'
const BLOCK_CHAR2 = '\u2588'
const NEXT = ' ' + chalk.blue(pointerSmall) + ' '
const BULLET = bullet
const TICK = tick
const CROSS = cross
const CIRCLE_OPEN = radioOff

const renderBar = (progress, color) => {
  const w = progress * (BAR_LENGTH / 100)
  const bg = chalk.white(BLOCK_CHAR)
  const fg = colorize(color)(BLOCK_CHAR2)
  return range(BAR_LENGTH)
    .map((i) => (i < w ? fg : bg))
    .join('')
}

const colorize = (color) => {
  if (color[0] === '#') {
    return chalk.hex(color)
  }
  return chalk[color] || chalk.keyword(color)
}

let lastRender = Date.now()

function range (len) {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const formatRequest = (request) => {
  const loaders = request.loaders.join(NEXT)
  if (!loaders.length) {
    return request.file || ''
  }
  return `${loaders}${NEXT}${request.file}`
}

class FancyReporter {
  constructor (name) {
    this.name = name || ''
  }

  allDone (context) {
    if (process.send) {
      process.send({
        status: 'done',
        message: ''
      })
    }
  }

  progress (context) {
    if (Date.now() - lastRender > 50) {
      this._renderStates(context.statesArray)
    }
  }

  _renderStates (statesArray, cb) {
    lastRender = Date.now()
    const renderedStates = statesArray.map((c) => this._renderState(c)).join('')
    if (renderedStates && process.send) {
      process.send(
        {
          status: 'progress',
          message: renderedStates
        },
        cb
      )
    } else {
      logUpdate.render(renderedStates + '\n')
      cb && cb()
    }
  }

  _renderState (state) {
    const color = colorize(state.color)
    let line1
    let line2
    if (state.progress >= 0 && state.progress < 100) {
      line1 = [
        color(BULLET),
        color(this.name),
        renderBar(state.progress, state.color),
        state.message,
        `(${state.progress || 0}%)`,
        chalk.grey(state.details[0] || ''),
        chalk.grey(state.details[1] || '')
      ].join(' ')
      line2 = state.request
        ? ' ' +
          chalk.grey(
            ellipsisLeft(formatRequest(state.request), logUpdate.columns)
          )
        : ''
    } else {
      let icon = ' '
      if (state.hasErrors) {
        icon = CROSS
      } else if (state.progress === 100) {
        icon = TICK
      } else if (state.progress === -1) {
        icon = CIRCLE_OPEN
      }
      line1 = color(`${icon} ${this.name}`)
      line2 = chalk.grey('  ' + state.message) + (state.result ? '\n' + state.result : '')
    }
    return line1 + '\n' + line2
  }
}

let reporter = null
/**
 * @returns {FancyReporter} - fancyReporter
 */
exports.getReporter = function () {
  if (reporter) return reporter
  return (reporter = new FancyReporter())
}

exports.LogUpdate = LogUpdate
exports.FancyReporter = FancyReporter
