const { merge } = require('webpack-merge')
const { resolvePluginWebpackConfig } = require('../config/mp/plugin')
const { resolveBaseRawWebpackConfig } = require('../config/mp/base')
const { getReporter } = require('./reporter')
const { extractResultFromStats, extractErrorsFromStats } = require('./output')
const { getWebpackName } = require('./name')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils/lib')

/**
 * 获取基础配置通过构建目标，该方法会运行插件方法并增加默认配置
 * @param {import('@vue/cli-service').PluginAPI} api
 * @param {import('@vue/cli-service').ProjectOptions} options
 * @returns
 */
function resolveWebpackConfigByTarget (
  api,
  options,
  target,
  resolveCustomConfig
) {
  // 强制添加一个修改webpack配置的方法，因为webpack-chain不支持webpack5
  api.service.webpackRawConfigFns.splice(
    api.service.webpackRawConfigFns.length - 1,
    0,
    resolveBaseRawWebpackConfig(api)
  )
  const webpackConfigs = []
  const chainWebpackConfig = api.resolveChainableWebpackConfig() // 所有的插件的chainWebpack， 和vue.config.js里的chainWebpack
  resolveCustomConfig && resolveCustomConfig(chainWebpackConfig, target)
  const webpackConfig = api.resolveWebpackConfig(chainWebpackConfig)
  webpackConfigs.push(webpackConfig)
  // 小程序插件构建配置
  if (target.mode === 'wx' && api.hasPlugin('mpx-plugin-mode')) {
    webpackConfigs.push(
      resolvePluginWebpackConfig(api, options, merge({}, webpackConfig))
    )
  }
  return webpackConfigs
}

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach((c) => fn(c))
  } else {
    fn(config)
  }
}

module.exports.handleWebpackDone = function (err, stats, target, api) {
  return new Promise((resolve, reject) => {
    if (err) return reject(err)
    const hasErrors = stats.hasErrors()
    const hasWarnings = stats.hasWarnings()
    const status = hasErrors
      ? 'with some errors'
      : hasWarnings
        ? 'with some warnings'
        : 'successfully'
    const result = []
    if (hasErrors) result.push(extractErrorsFromStats(stats))
    if (!hasErrors) result.push(extractResultFromStats(stats))
    getReporter()._renderStates(
      stats.stats.map((v) => {
        return {
          ...v,
          name: v.compilation.name,
          message: `Compiled ${status}`,
          color: hasErrors ? 'red' : 'green',
          progress: 100,
          hasErrors: hasErrors,
          result: result.join('\n')
        }
      }),
      () => (hasErrors ? reject(new Error('Build error')) : resolve(stats))
    )
  })
}

module.exports.modifyMpxPluginConfig = function (api, config, pluginConfig) {
  config.plugin('mpx-webpack-plugin').tap((args) => {
    Object.assign(args[0], pluginConfig)
    const name = getWebpackName(api, getCurrentTarget(), args[0])
    config.name(name)
    config.plugin('webpackbar').tap((args) => {
      args[0].name = name
      return args
    })
    return args
  })
}

module.exports.modifyConfig = modifyConfig
module.exports.resolveWebpackConfigByTarget = resolveWebpackConfigByTarget
