const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const { getTargets } = require('../utils/index')
const {
  resolveWebpackConfigByTargets,
  runWebpack
} = require('../utils/webpack')

module.exports = function registerServeCommand (api, options) {
  api.registerCommand(
    'serve:mp',
    {
      description: 'mp development',
      usage: 'mpx-cli-service serve:mp',
      options: {
        '--targets': `compile for target platform, support ${supportedModes}`
      }
    },
    function (args) {
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
        (webpackConfig) => {
          webpackConfig.devtool('source-map')
        }
      )
      return runWebpack(webpackConfigs, true)
    }
  )
}
