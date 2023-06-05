const { parseTarget } = require('../../utils/index')
const { symlinkTargetConfig } = require('../../utils/symlinkTargetConfig')
const {
  resolveWebpackConfigByTarget,
  extractResultFromStats,
  extractErrorsFromStats
} = require('../../utils/webpack')
const { getReporter } = require('../../utils/reporter')
const webpack = require('webpack')

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
  api.registerCommand('serve:mp', {}, function (args, rawArgv) {
    const target = parseTarget(args.target, options)

    // 小程序业务代码构建配置
    const webpackConfigs = resolveMpServeWebpackConfig(api, options, args)
    return new Promise((resolve, reject) => {
      webpack(webpackConfigs).watch({}, (err, res) => {
        if (err) return reject(err)
        const hasErrors = res.hasErrors()
        const hasWarnings = res.hasWarnings()
        const status = hasErrors
          ? 'with some errors'
          : hasWarnings
            ? 'with some warnings'
            : 'successfully'
        const result = []
        if (hasErrors) result.push(extractErrorsFromStats(res))
        if (hasWarnings) result.push(extractErrorsFromStats(res, 'warnings'))
        if (!hasErrors) result.push(extractResultFromStats(res))
        getReporter()._renderStates(
          res.stats.map((v) => {
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
          () => {
            if (hasErrors) {
              if (err) reject(err)
            } else resolve(res)
          }
        )
        symlinkTargetConfig(api, target, webpackConfigs[0])
      })
    })
  })
}
