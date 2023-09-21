const execa = require('execa')

const SUPPORT_MODE = ['wx', 'ali', 'swan', 'qq', 'tt', 'dd', 'web']
const MODE_CONFIG_FILES_MAP = {
  wx: ['project.config.json'],
  ali: ['mini.project.json'],
  swan: ['project.swan.json'],
  qq: ['project.config.json'],
  tt: ['project.config.json'],
  dd: ['project.config.json'],
  web: []
}
const DEFAULT_MODE = 'wx'
const supportedModeMap = makeMap(SUPPORT_MODE)
const mpxCliServiceBinPath = require.resolve(
  '@mpxjs/mpx-cli-service/bin/mpx-cli-service.js'
)

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
function getMpxPluginOptions (options = {}) {
  return options.pluginOptions ? options.pluginOptions.mpx || {} : {}
}

function rawTarget (target) {
  return [target.mode, target.env].filter(Boolean).join(':')
}

function getTargets (args) {
  const defaultTargets = [{ mode: 'wx' || SUPPORT_MODE[0] }]
  const inputTargets = args.targets
    ? args.targets.split(/[,|]/)
    : Object.keys(args)
  const targets = inputTargets
    .map((v) => parseTarget(v))
    .filter((v) => supportedModeMap[v.mode])
  return targets.length ? targets : defaultTargets
}

function parseTarget (target = '') {
  let [mode, env] = target.split(':')
  if (!mode) mode = 'wx' || SUPPORT_MODE[0]
  return {
    mode,
    env
  }
}

function getCurrentTarget () {
  const currentTarget = {
    mode: process.env.MPX_CURRENT_TARGET_MODE,
    env: process.env.MPX_CURRENT_TARGET_ENV
  }
  return currentTarget
}

function setTargetProcessEnv (target) {
  if (target.mode) {
    process.env.MPX_CLI_MODE = target.mode === 'web' ? 'web' : 'mp'
    process.env.MPX_CURRENT_TARGET_MODE = target.mode
  }
  if (target.env) {
    process.env.MPX_CURRENT_TARGET_ENV = target.env
  }
}

function removeArgv (rawArgv, removeName) {
  return rawArgv.filter((argv) => argv.indexOf(removeName) === -1)
}

function runServiceCommand (rawArgv, options = {}) {
  return execa.node(mpxCliServiceBinPath, [...rawArgv], options)
}

/**
 * @typedef { 'wx'|'ali'|'swan' | 'qq' | 'tt' |'dd' |'web' } Mode
 */

/**
 * @typedef { Mode[] } SupportMode
 * @type { SupportMode }
 */
module.exports.SUPPORT_MODE = SUPPORT_MODE
module.exports.MODE_CONFIG_FILES_MAP = MODE_CONFIG_FILES_MAP
module.exports.DEFAULT_MODE = DEFAULT_MODE
module.exports.getCurrentTarget = getCurrentTarget
module.exports.runServiceCommand = runServiceCommand
module.exports.makeMap = makeMap
module.exports.getTargets = getTargets
module.exports.parseTarget = parseTarget
module.exports.getMpxPluginOptions = getMpxPluginOptions
module.exports.setTargetProcessEnv = setTargetProcessEnv
module.exports.removeArgv = removeArgv
module.exports.rawTarget = rawTarget
