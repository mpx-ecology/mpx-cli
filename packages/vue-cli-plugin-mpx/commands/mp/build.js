const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { parseTarget } = require('../../utils/index')
const {
  resolveWebpackConfigByTarget,
  extractResultFromStats,
  extractErrorsFromStats
} = require('../../utils/webpack')
const { symLinkTargetConfig } = require('../../utils/symLinkTargetConfig')
const { getReporter } = require('../../utils/reporter')
const webpack = require('webpack')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function registerBuildCommand (api, options) {
  api.registerCommand('build:mp', {}, function (args, rawArgv) {
    const watch = !!args.watch
    const customMpxEnv = args.env
    const target = parseTarget(args.target, options)
    console.log('file: build.js:18 > target:', target)

    // 小程序业务代码构建配置
    const webpackConfigs = resolveWebpackConfigByTarget(
      api,
      options,
      (webpackConfig) => {
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
      }
    )

    return new Promise((resolve, reject) => {
      webpack(webpackConfigs, (err, res) => {
        const hasErrors = err || res.hasErrors()
        const status = hasErrors ? 'with some errors' : 'successfully'
        getReporter()._renderStates(
          res.stats.map((v) => {
            return {
              ...v,
              name: `${target.mode}-compiler`,
              message: `Compiled ${status}`,
              color: hasErrors ? 'red' : 'green',
              progress: 100,
              hasErrors: hasErrors,
              result: hasErrors
                ? extractErrorsFromStats(res)
                : extractResultFromStats(res)
            }
          }),
          () => (hasErrors ? reject(err) : resolve(res))
        )
        symLinkTargetConfig(api, target, webpackConfigs[0])
      })
    })
  })
}
