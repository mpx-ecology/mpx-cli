const { resolveBaseRawWebpackConfig } = require('./base')
const { resolvePluginWebpackConfig } = require('./plugin')
/**
 * 获取构建模式基础配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @returns
 */
function resolveBuildWebpackConfigByTarget (api, options, target, args) {
  // 强制添加一个修改webpack配置的方法，因为webpack-chain不支持webpack5
  api.service.webpackRawConfigFns.splice(
    api.service.webpackRawConfigFns.length - 1,
    0,
    resolveBaseRawWebpackConfig(api)
  )
  let webpackConfigs
  if (target.mode === 'web') {
    // web配置，使用vue-cli内置的方法获取配置 + mpx-cli 修改后的配置
    const resolveAppConfig = require('@vue/cli-service/lib/commands/build/resolveAppConfig')
    const validConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')
    webpackConfigs = [resolveAppConfig(api, args, options)]
    validConfig(webpackConfigs, api, options)
  } else {
    // 小程序配置，使用mpx-cli内置的配置
    webpackConfigs = [api.resolveWebpackConfig()]
    // 小程序插件构建配置
    if (target.mode === 'wx' && api.hasPlugin('mpx-plugin-mode')) {
      webpackConfigs.push(resolvePluginWebpackConfig(api, webpackConfigs[0]))
    }
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
  api.service.webpackRawConfigFns.splice(
    api.service.webpackRawConfigFns.length - 1,
    0,
    resolveBaseRawWebpackConfig(api)
  )
  const webpackConfigs = [api.resolveWebpackConfig()]
  if (target.mode === 'web') {
    const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')
    validateWebpackConfig(webpackConfigs[0], api, options)
    return webpackConfigs[0]
  }
  // 小程序插件构建配置
  if (target.mode === 'wx' && api.hasPlugin('mpx-plugin-mode')) {
    webpackConfigs.push(resolvePluginWebpackConfig(api, webpackConfigs[0]))
  }
  return webpackConfigs
}

module.exports.resolveBuildWebpackConfigByTarget =
  resolveBuildWebpackConfigByTarget
module.exports.resolveServeWebpackConfigByTarget =
  resolveServeWebpackConfigByTarget
