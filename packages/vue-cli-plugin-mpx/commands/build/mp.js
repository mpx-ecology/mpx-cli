const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { parseTarget } = require('../../utils/index')
const {
  resolveWebpackConfigByTarget,
  extractResultFromStats
} = require('../../utils/webpack')
const { symLinkTargetConfig } = require('../../utils/symLinkTargetConfig')
const { getReporter } = require('../../utils/reporter')
const { output } = require('../../utils/output')
const webpack = require('webpack')

const resolveMpBuildWebpackConfig = (api, options, args) => {
  const watch = !!args.watch
  const customMpxEnv = args.env
  const target = parseTarget(args.target, options)
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
  api.registerCommand('build:mp', {}, function (args, rawArgv) {
    const target = parseTarget(args.target, options)
    // 小程序业务代码构建配置
    const webpackConfigs = resolveMpBuildWebpackConfig(api, options, args)
    return new Promise((resolve, reject) => {
      webpack(webpackConfigs, (err, stats) => {
        if (err) return reject(err)
        const hasErrors = stats.hasErrors()
        const hasWarnings = stats.hasWarnings()
        const status = hasErrors
          ? 'with some errors'
          : hasWarnings
            ? 'with some warnings'
            : 'successfully'
        const result = []
        if (hasErrors) result.push(extractResultFromStats(stats))
        if (hasWarnings) result.push(output.getErrors(stats, 'warnings'))
        if (!hasErrors) result.push(extractResultFromStats(stats))
        getReporter()._renderStates(
          stats.stats.map((v) => {
            return {
              ...v,
              name: `${target.mode}-compiler`,
              message: `Compiled ${status}`,
              color: hasErrors ? 'red' : 'green',
              progress: 100,
              hasErrors: hasErrors,
              result: result.join('\n')
            }
          }),
          () => (hasErrors ? reject(new Error('Build error')) : resolve(stats))
        )
        symLinkTargetConfig(api, target, webpackConfigs[0])
      })
    })
  })
}

module.exports.resolveMpBuildWebpackConfig = resolveMpBuildWebpackConfig
