const { resolveBaseRawWebpackConfig } = require('./base')
const { resolvePluginWebpackConfig } = require('./plugin')

/**
 * 强制添加一个修改webpack最终配置的方法
 * @param {*} api
 * @param {*} config
 */
function addRawConfigBeforeUserConfig (api, config) {
  api.service.webpackRawConfigFns.splice(
    api.service.webpackRawConfigFns.length - 1,
    0,
    config
  )
}

function addPluginConfig (api, options, target, webpackConfigs) {
  if (target.mode === 'wx' && api.hasPlugin('mpx-plugin-mode')) {
    webpackConfigs.push(resolvePluginWebpackConfig(api, webpackConfigs[0]))
  }
}

/**
 * 校验web的webpack配置
 * @param {*} webpackConfigs
 * @param {*} api
 * @param {*} options
 * @returns
 */
function validWebConfig (webpackConfigs, api, options) {
  const validConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')
  return validConfig(webpackConfigs, api, options)
}

/**
 * 获取构建模式基础配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @returns
 */
function resolveBuildWebpackConfigByTarget (api, options, target, args) {
  // 强制添加一个修改webpack配置的方法，因为webpack-chain不支持webpack5
  addRawConfigBeforeUserConfig(api, resolveBaseRawWebpackConfig(api))
  let webpackConfigs
  if (target.mode === 'web') {
    // web配置，使用vue-cli内置的方法获取配置 + mpx-cli 修改后的配置
    const resolveAppConfig = require('@vue/cli-service/lib/commands/build/resolveAppConfig')
    webpackConfigs = [resolveAppConfig(api, args, options)]
    validWebConfig(webpackConfigs, api, options)
  } else {
    // 小程序配置，使用mpx-cli内置的配置
    webpackConfigs = [api.resolveWebpackConfig()]
    // 小程序插件构建配置
    addPluginConfig(api, options, target, webpackConfigs)
  }
  return webpackConfigs
}

/**
 * 获取开发模式基础配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @returns
 */
function resolveServeWebpackConfigByTarget (api, options, target, args) {
  // 强制添加一个修改webpack配置的方法，因为webpack-chain不支持webpack5
  addRawConfigBeforeUserConfig(api, resolveBaseRawWebpackConfig(api))
  const webpackConfigs = [api.resolveWebpackConfig()]
  if (target.mode === 'web') {
    validWebConfig(webpackConfigs, api, options)
    return webpackConfigs[0]
  }
  // 小程序插件构建配置
  addPluginConfig(api, options, target, webpackConfigs)
  return webpackConfigs
}

module.exports.resolveBuildWebpackConfigByTarget =
  resolveBuildWebpackConfigByTarget
module.exports.resolveServeWebpackConfigByTarget =
  resolveServeWebpackConfigByTarget
