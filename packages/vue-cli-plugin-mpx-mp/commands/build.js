const webpack = require('webpack')
const {
  transformMpxEntry,
  supportedModes
} = require('@mpxjs/vue-cli-plugin-mpx')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const applyMpWebpackConfig = require('../config')
const resolveMpBaseWebpackConfig = require('../base')
const {
  resolveWebpackCompileCallback,
  clearDist,
  getTargets,
  addMpPluginWebpackConfig
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
      const webpackConfigs = targets.map((mode) => {
        clearDist(api.resolve(`dist/${mode}/*`))
        const baseWebpackConfig = resolveMpBaseWebpackConfig(api, options)
        if (process.env.NODE_ENV === 'production') {
          baseWebpackConfig.mode('production')
        }
        if (args.report) {
          baseWebpackConfig
            .plugin('bundle-analyzer-plugin')
            .use(BundleAnalyzerPlugin, [{}])
        }
        baseWebpackConfig.devtool(isWatching ? 'source-map' : false)
        // 根据不同 mode 修改小程序构建的 webpack 配置
        applyMpWebpackConfig(api, options, baseWebpackConfig, mode)
        // vue.config.js 当中 configureWebpack 的优先级要比 chainWebpack 更高
        const webpackConfig = api.resolveWebpackConfig(baseWebpackConfig)
        transformMpxEntry(api, options, webpackConfig, false)
        return webpackConfig
      })

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
