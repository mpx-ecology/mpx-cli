const webpack = require('webpack')
const {
  transformMpxEntry,
  supportedModes
} = require('@mpxjs/vue-cli-plugin-mpx')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const applyMpWebpackConfig = require('../config')
const resolveMpBaseWebpackConfig = require('../base')
const {
  resolveWebpackCompileCallback,
  clearDist,
  getTargets,
  addMpPluginWebpackConfig
} = require('../utils')

module.exports = function registerMpCommand (api, options) {
  api.registerCommand(
    'serve:mp',
    {
      description: 'mp development',
      usage: 'mpx-cli-service serve:mp',
      options: {
        '--target': `compile for target platform, support ${supportedModes}`
      }
    },
    function (args) {
      const mode = api.service.mode
      const targets = getTargets(args, options)

      logWithSpinner('⚓', `Building for ${mode} of ${targets.join(',')}...`)
      // 小程序业务代码构建配置
      const webpackConfigs = targets.map((mode) => {
        clearDist(api.resolve(`dist/${mode}/*`))
        const baseWebpackConfig = resolveMpBaseWebpackConfig(api, options)
        baseWebpackConfig.devtool('source-map')
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

      webpack(webpackConfigs).watch({}, resolveWebpackCompileCallback(true))
    }
  )
}