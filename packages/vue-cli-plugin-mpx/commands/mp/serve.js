const { parseTarget } = require('../../utils/index')
const { symLinkTargetConfig } = require('../../utils/symLinkTargetConfig')
const {
  resolveWebpackConfigByTarget,
  extractResultFromStats,
  extractErrorsFromStats
} = require('../../utils/webpack')
const { getReporter } = require('../../utils/reporter')
const webpack = require('webpack')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function registerServeCommand (api, options) {
  api.registerCommand('serve:mp', {}, function (args, rawArgv) {
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
    return new Promise((resolve, reject) => {
      webpack(webpackConfigs).watch({}, (err, res) => {
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
          () => {
            if (hasErrors) {
              if (err) reject(err)
            } else resolve(res)
          }
        )
        symLinkTargetConfig(api, target, webpackConfigs[0])
      })
    })
  })
}
