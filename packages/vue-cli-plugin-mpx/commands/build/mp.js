const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { getCurrentTarget } = require('@mpxjs/cli-shared')
const {
  resolveWebpackConfigByTarget,
  handleWebpackDone
} = require('../../utils/webpack')
const { symlinkTargetConfig } = require('../../utils/symlinkTargetConfig')
const webpack = require('webpack')

const resolveMpBuildWebpackConfig = (api, options, args) => {
  const watch = !!args.watch
  const customMpxEnv = args.env
  const target = getCurrentTarget()
  api.chainWebpack((config) => {
    const targetEnv = target.env
    if (targetEnv === 'production' || targetEnv === 'development') {
      config.mode(targetEnv === 'production' ? targetEnv : 'none')
      config.plugin('define').tap((args) => [
        {
          'process.env.NODE_ENV': `"${targetEnv}"`
        }
      ])
    }
    if (args.report) {
      config.plugin('bundle-analyzer-plugin').use(BundleAnalyzerPlugin, [{}])
    }
    if (customMpxEnv) {
      config.plugin('mpx-webpack-plugin').tap((args) => {
        args[0].env = customMpxEnv
        return args
      })
    }
    // 仅在watch模式下生产sourcemap
    // 百度小程序不开启sourcemap，开启会有模板渲染问题
    if (watch && target.mode !== 'swan') {
      config.devtool('source-map')
    }
    if (args.watch) {
      config.watch(true)
    }
  })
  return resolveWebpackConfigByTarget(api, options, target)
}

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.buildMp = function buildMp (api, options, args) {
  const target = getCurrentTarget()
  // 小程序业务代码构建配置
  const webpackConfigs = resolveMpBuildWebpackConfig(api, options, args)
  return new Promise((resolve, reject) => {
    webpack(webpackConfigs, (err, stats) => {
      handleWebpackDone(err, stats, target, api)
        .then((...res) => {
          symlinkTargetConfig(api, target, webpackConfigs[0])
          resolve(...res)
        })
        .catch(reject)
    })
  })
}

module.exports.resolveMpBuildWebpackConfig = resolveMpBuildWebpackConfig
