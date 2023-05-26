const execa = require('execa')
const { SUPPORT_MODE } = require('../constants/mode')

const supportedModeMap = makeMap(SUPPORT_MODE)
const mpxCliServiceBinPath = require.resolve(
  '@mpxjs/mpx-cli-service/bin/mpx-cli-service.js'
)

/**
 * 取数组交集
 * @param {array} a
 * @param {array} b
 */
function intersection (a, b) {
  return a.filter((v) => b.includes(v))
}

/**
 * makeMap
 * @param {*} arr
 * @returns
 */
function makeMap (arr) {
  const map = {}
  arr.forEach((v) => (map[v] = true))
  return map
}

/**
 * 获取@mpxjs/webpack-plugin选项
 * @param {*} options 选项
 */
function getMpxPluginOptions (options) {
  return options.pluginOptions ? options.pluginOptions.mpx || {} : {}
}

/**
 * 获取最终的targets
 * @param {*} args
 * @param {*} options
 * @returns { Target[] }
 */
function getTargets (args, options) {
  const mpxOptions = getMpxPluginOptions(options)
  const defaultTargets = [{ mode: mpxOptions.srcMode || SUPPORT_MODE[0] }]
  const inputTargets = args.targets
    ? args.targets.split(/[,|]/)
    : Object.keys(args)
  const targets = inputTargets
    .map((v) => parseTarget(v, options))
    .filter((v) => supportedModeMap[v.mode])
  return targets.length ? targets : defaultTargets
}

function parseTarget (target, options) {
  const mpxOptions = getMpxPluginOptions(options)
  const [mode = mpxOptions.srcMode || SUPPORT_MODE[0], env] = target.split(':')
  return {
    mode,
    env
  }
}

function removeArgv (rawArgv, removeName) {
  return rawArgv.filter((argv) => argv.indexOf(removeName) === -1)
}

function runServiceCommand (command, rawArgv, options = {}) {
  return execa.node(mpxCliServiceBinPath, [command, ...rawArgv], options)
}

module.exports.runServiceCommand = runServiceCommand
module.exports.removeArgv = removeArgv
module.exports.makeMap = makeMap
module.exports.getTargets = getTargets
module.exports.parseTarget = parseTarget
module.exports.intersection = intersection
module.exports.getMpxPluginOptions = getMpxPluginOptions
