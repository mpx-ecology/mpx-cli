const webpack = require('webpack')
const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const {
  resolveWebpackCompileCallback,
  getTargets,
  addMpPluginWebpackConfig,
  genWebpackConfigByTargets
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
      const webpackConfigs = genWebpackConfigByTargets(
        api,
        options,
        targets,
        (webpacConfig) => {
          webpacConfig.devtool('source-map')
        }
      )
      // 小程序插件构建配置
      if (api.hasPlugin('mpx-plugin-mode')) {
        addMpPluginWebpackConfig(api, options, webpackConfigs)
      }
      webpack(webpackConfigs).watch({}, resolveWebpackCompileCallback(true))
    }
  )
}
