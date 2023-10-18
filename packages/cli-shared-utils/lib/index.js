
/**
 * @typedef { 'wx' | 'ali' | 'swan' | 'qq' | 'tt' | 'dd' | 'web' } Mode
 * @typedef { { mode: Mode, env: 'development' | 'production' } } Target
 */

const { makeMap, runServiceCommand, removeArgv, normalizeCommandArgs } = require('./utils')
const {
  SUPPORT_MODE,
  MODE_CONFIG_FILES_MAP,
  DEFAULT_MODE,
  getCurrentTarget,
  getTargets,
  parseTarget,
  rawTarget,
  setTargetProcessEnv
} = require('./target')
const {
  modifyMpxPluginConfig,
  updateWebpackName,
  modifyConfig,
  getWebpackName
} = require('./webpack')
const { getMpxPluginOptions } = require('./mpx')

module.exports.SUPPORT_MODE = SUPPORT_MODE
module.exports.MODE_CONFIG_FILES_MAP = MODE_CONFIG_FILES_MAP
module.exports.DEFAULT_MODE = DEFAULT_MODE
module.exports.runServiceCommand = runServiceCommand
module.exports.makeMap = makeMap
module.exports.removeArgv = removeArgv
module.exports.normalizeCommandArgs = normalizeCommandArgs
module.exports.getCurrentTarget = getCurrentTarget
module.exports.getTargets = getTargets
module.exports.parseTarget = parseTarget
module.exports.getMpxPluginOptions = getMpxPluginOptions
module.exports.setTargetProcessEnv = setTargetProcessEnv
module.exports.rawTarget = rawTarget
module.exports.modifyMpxPluginConfig = modifyMpxPluginConfig
module.exports.updateWebpackName = updateWebpackName
module.exports.modifyConfig = modifyConfig
module.exports.getWebpackName = getWebpackName
