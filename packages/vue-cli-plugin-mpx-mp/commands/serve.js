const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { logWithSpinner, stopSpinner } = require('@vue/cli-shared-utils')
const { getTargets, runServiceCommandByTargets } = require('../utils/index')
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
    function (args, rawArgv) {
      const mode = api.service.mode
      const targets = getTargets(args, options)
      const openChildProcess =
        !!args['open-child-process'] && targets.length > 1

      logWithSpinner(
        '⚓',
        `Building for ${mode} of ${targets.map((v) => v.mode).join(',')}...`
      )

      if (openChildProcess) {
        return runServiceCommandByTargets(targets, 'serve:mp', rawArgv).then(
          (results) => {
            stopSpinner()
            console.log(results.map(({ stdout }) => stdout).join('\n'))
          }
        )
      }

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
