const webpack = require('webpack')
const { parseTarget } = require('../../utils/index')
const { symlinkTargetConfig } = require('../../utils/symlinkTargetConfig')
const { resolveWebpackConfigByTarget, handleWebpackDone } = require('../../utils/webpack')
const { resolveMpWebpackConfig } = require('../../config/mp/base')

const resolveMpServeWebpackConfig = (api, options, args) => {
  const customMpxEnv = args.env
  const target = parseTarget(args.target, options)
  // 小程序业务代码构建配置
  const webpackConfigs = resolveWebpackConfigByTarget(
    api,
    options,
    target,
    (webpackConfig) => {
      webpackConfig.devtool('source-map')
      if (customMpxEnv) {
        webpackConfig.plugin('mpx-webpack-plugin').tap((args) => {
          args[0].env = customMpxEnv
          return args
        })
      }
    }
  )
  return webpackConfigs
}

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.registerMpServeCommand = function registerMpServeCommand (
  api,
  options
) {
  api.registerCommand('serve:mp', {}, function (args, rawArgs) {
    if ((args.targets && !args.target) || !args.target) {
      return api.service.commands.serve.fn(args, rawArgs)
    }
    const target = parseTarget(args.target, options)
    api.chainWebpack((config) => {
      resolveMpWebpackConfig(api, options, config, target)
    })
    // 小程序业务代码构建配置
    const webpackConfigs = resolveMpServeWebpackConfig(api, options, args)
    return new Promise((resolve, reject) => {
      webpack(webpackConfigs).watch({}, (err, stats) => {
        handleWebpackDone(err, stats, target).then((...res) => {
          symlinkTargetConfig(api, target, webpackConfigs[0])
          resolve(...res)
        }).catch(reject)
      })
    })
  })
}
