const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { getCurrentTarget } = require('../../utils/index')
const { resolveWebpackConfigByTarget, handleWebpackDone } = require('../../utils/webpack')
const { symlinkTargetConfig } = require('../../utils/symlinkTargetConfig')
const webpack = require('webpack')
const { resolveMpWebpackConfig } = require('../../config/mp/base')

const resolveMpBuildWebpackConfig = (api, options, args) => {
  const watch = !!args.watch
  const customMpxEnv = args.env
  const target = getCurrentTarget()
  return resolveWebpackConfigByTarget(api, options, (webpackConfig) => {
    const targetEnv = target.env
    if (targetEnv === 'production' || targetEnv === 'development') {
      webpackConfig.mode(targetEnv === 'production' ? targetEnv : 'none')
      webpackConfig.plugin('define').tap((args) => [
        {
          'process.env.NODE_ENV': `"${targetEnv}"`
        }
      ])
    }
    if (args.report) {
      webpackConfig
        .plugin('bundle-analyzer-plugin')
        .use(BundleAnalyzerPlugin, [{}])
    }
    if (customMpxEnv) {
      webpackConfig.plugin('mpx-webpack-plugin').tap((args) => {
        args[0].env = customMpxEnv
        return args
      })
    }
    // 仅在watch模式下生产sourcemap
    // 百度小程序不开启sourcemap，开启会有模板渲染问题
    webpackConfig.devtool(
      watch && target.mode !== 'swan' ? 'source-map' : false
    )

    if (args.watch) {
      webpackConfig.watch(true)
    }
  })
}

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.registerMpBuildCommand = function registerMpBuildCommand (
  api,
  options
) {
  api.registerCommand('build:mp', {}, function (args, rawArgs) {
    const target = getCurrentTarget()
    if ((args.targets && !target.mode) || !target.mode) {
      return api.service.commands.build.fn(args, rawArgs)
    }
    api.chainWebpack((config) => {
      resolveMpWebpackConfig(api, options, config, target)
    })
    // 小程序业务代码构建配置
    const webpackConfigs = resolveMpBuildWebpackConfig(api, options, args)
    return new Promise((resolve, reject) => {
      webpack(webpackConfigs, (err, stats) => {
        handleWebpackDone(err, stats, target).then((...res) => {
          symlinkTargetConfig(api, target, webpackConfigs[0])
          resolve(...res)
        }).catch(reject)
      })
    })
  })
}

module.exports.resolveMpBuildWebpackConfig = resolveMpBuildWebpackConfig
