/* eslint-disable no-tabs */
const chalk = require('chalk')
const LogUpdate = require('./logUpdate')

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

function getWebpackMpResult (stats) {
  if (stats.hasErrors()) {
    return new Error(
      chalk.red('Build failed with errors.\n') + extractErrorsFromStats(stats)
    )
  }
  const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats]
  return statsArr.map((item) => {
    return item
      .toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false
      })
      .split('\n')
      .map((v) => `  ${v}`)
      .join('\n')
  })
}

function uniqueBy (arr, fun) {
  const seen = {}
  return arr.filter((el) => {
    const e = fun(el)
    return !(e in seen) && (seen[e] = 1)
  })
}

function isMultiStats (stats) {
  return stats.stats
}

function extractErrorsFromStats (stats, type = 'errors') {
  if (isMultiStats(stats)) {
    const errors = stats.stats.reduce(
      (errors, stats) => errors.concat(extractErrorsFromStats(stats, type)),
      []
    )
    // Dedupe to avoid showing the same error many times when multiple
    // compilers depend on the same module.
    return uniqueBy(errors, (error) => error.message)
  }

  const findErrorsRecursive = (compilation) => {
    const errors = compilation[type]
    if (errors.length === 0 && compilation.children) {
      for (const child of compilation.children) {
        errors.push(...findErrorsRecursive(child))
      }
    }
    return uniqueBy(errors, (error) => error.message)
  }

  return findErrorsRecursive(stats.compilation)
}

class FancyReporter {
  allDone (context) {
    if (process.send) {
      process.send({
        status: 'done',
        message: ''
      })
    }
  }

  done (context, { stats }) {
    this._renderStates(
      context.statesArray.map((v) => {
        return {
          ...v,
          message: v.message,
          result: getWebpackMpResult(stats)
        }
      })
    )
  }

  progress (context) {
    if (!logUpdate) return
    if (Date.now() - lastRender > 50) {
      this._renderStates(context.statesArray)
    }
  }

  _renderStates (statesArray) {
    lastRender = Date.now()
    const renderedStates = statesArray.map((c) => this._renderState(c)).join('')
    if (renderedStates && process.send) {
      process.send({
        status: 'progress',
        message: renderedStates
      })
    }
  }

  _renderState (state) {
    if (state.details.includes('IdleFileCachePlugin')) return
    const color = colorize(state.color)
    let line1
    let line2
    if (state.progress >= 0 && state.progress < 100) {
      line1 = [
        color(BULLET),
        color(state.name),
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
      line1 = color(`${icon} ${state.name}`)
      line2 = chalk.grey('  ' + state.message) + '\n' + state.result
    }
    return line1 + '\n' + line2
  }
}

exports.FancyReporter = FancyReporter
