const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const { getTargets } = require('../utils/index')
const {
  resolveWebpackConfigByTargets,
  runWebpack
} = require('../utils/webpack')

module.exports = function registerBuildCommand (api, options) {
  api.registerCommand(
    'build:mp',
    {
      description: 'mp production',
      usage: 'mpx-cli-service build:mp',
      options: {
        '--target': `compile for target platform, support ${supportedModes}`,
        '--watch': 'compile in watch mode',
        '--report': 'generate report.html to help analyze bundle content'
      }
    },
    function (args) {
      const isWatching = !!args.watch
      const mode = api.service.mode
      const targets = getTargets(args, options)

      logWithSpinner(
        '⚓',
        `Building for ${mode} of ${targets.map((v) => v.mode).join(',')}...`
      )
      // 小程序业务代码构建配置
      const webpackConfigs = resolveWebpackConfigByTargets(
        api,
        options,
        targets,
        (webpackConfig, target) => {
          if (target.env) {
            webpackConfig.mode(target.env)
          } else if (process.env.NODE_ENV === 'production') {
            webpackConfig.mode('production')
          }
          if (args.report) {
            webpackConfig
              .plugin('bundle-analyzer-plugin')
              .use(BundleAnalyzerPlugin, [{}])
          }
          webpackConfig.devtool(isWatching ? 'source-map' : false)
        }
      )
      return runWebpack(webpackConfigs, isWatching)
    }
  )
}
