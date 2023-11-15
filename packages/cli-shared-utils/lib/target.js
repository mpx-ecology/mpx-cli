const { makeMap } = require('./utils')

/**
 * @typedef { import('.').Mode } Mode
 * @typedef { import('.').Target } Target
 */

/**
 * @type { Mode[] }
 */
const SUPPORT_MODE = ['wx', 'ali', 'swan', 'qq', 'tt', 'dd', 'web']

/**
 * @type { Object.<Mode, string[]> }
 */
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

/**
 *
 * @param {Target} target
 * @returns
 */
function rawTarget (target) {
  return [target.mode, target.env].filter(Boolean).join(':')
}

/**
 * 根据args获取targets
 * @param {*} args
 * @returns { Target[] }
 */
function getTargets (args) {
  const defaultTargets = [{ mode: 'wx' || SUPPORT_MODE[0] }]
  const inputTargets = args.targets
    ? args.targets.split(/[,|]/)
    : Object.keys(args)
  const command = args._[0]
  let targets = []
  if (command === 'serve:ssr' || command === 'build:ssr') {
    targets = [{ mode: 'web' }]
  } else {
    targets = inputTargets
      .map((v) => parseTarget(v))
      .filter((v) => supportedModeMap[v.mode])
  }
  return targets.length ? targets : defaultTargets
}

/**
 * 根据mode:env解析target
 * @param { string } target
 * @returns { Target }
 */
function parseTarget (target = '') {
  let [mode, env] = target.split(':')
  if (!mode) mode = 'wx' || SUPPORT_MODE[0]
  return {
    mode,
    env
  }
}

/**
 * 设置target process env
 * @param { Target } target
 */
function setTargetProcessEnv (target) {
  if (target.mode) {
    process.env.MPX_CLI_MODE = target.mode === 'web' ? 'web' : 'mp'
    process.env.MPX_CURRENT_TARGET_MODE = target.mode
  }
  if (target.env) {
    process.env.MPX_CURRENT_TARGET_ENV = target.env
  }
}

/**
 * 获取当前构建的target
 * @returns { Target }
 */
function getCurrentTarget () {
  const currentTarget = {
    mode: process.env.MPX_CURRENT_TARGET_MODE,
    env: process.env.MPX_CURRENT_TARGET_ENV
  }
  return currentTarget
}

module.exports.getCurrentTarget = getCurrentTarget
module.exports.setTargetProcessEnv = setTargetProcessEnv
module.exports.getTargets = getTargets
module.exports.parseTarget = parseTarget
module.exports.rawTarget = rawTarget
module.exports.SUPPORT_MODE = SUPPORT_MODE
module.exports.MODE_CONFIG_FILES_MAP = MODE_CONFIG_FILES_MAP
module.exports.DEFAULT_MODE = DEFAULT_MODE
