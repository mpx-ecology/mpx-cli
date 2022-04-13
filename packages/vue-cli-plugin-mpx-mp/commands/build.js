const webpack = require('webpack')
const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const {
  resolveWebpackCompileCallback,
  getTargets,
  addMpPluginWebpackConfig,
  genWebpackConfigByTargets
} = require('../utils')

module.exports = function registerMpBuildCommand (api, options) {
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

      logWithSpinner('⚓', `Building for ${mode} of ${targets.join(',')}...`)
      // 小程序业务代码构建配置
      const webpackConfigs = genWebpackConfigByTargets(
        api,
        options,
        targets,
        (webpackConfig) => {
          if (process.env.NODE_ENV === 'production') {
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
      // 小程序插件构建配置
      if (api.hasPlugin('mpx-plugin-mode')) {
        addMpPluginWebpackConfig(api, options, webpackConfigs)
      }
      const webpackCallback = resolveWebpackCompileCallback(isWatching)
      if (!isWatching) {
        webpack(webpackConfigs, webpackCallback)
      } else {
        webpack(webpackConfigs).watch({}, webpackCallback)
      }
    }
  )
}
