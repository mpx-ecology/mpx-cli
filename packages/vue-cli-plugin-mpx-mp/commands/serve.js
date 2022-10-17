const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const { getTargets } = require('../utils/index')
const { symLinkTargetConfig } = require('../utils/symlinkTargetConfig')
const {
  resolveWebpackConfigByTargets,
  runWebpack,
  runWebpackInChildProcess
} = require('../utils/webpack')

module.exports = function registerServeCommand (api, options) {
  api.registerCommand(
    'serve:mp',
    {
      description: 'mp development',
      usage: 'mpx-cli-service serve:mp',
      options: {
        '--targets': `compile for target platform, support ${MODE.SUPPORT_MODE}`
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
        return runWebpackInChildProcess('serve:mp', rawArgv, { targets, watch: true })
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
      return runWebpack(webpackConfigs, {
        watch: true
      }).then(res => {
        symLinkTargetConfig(api, targets, webpackConfigs)
      })
    }
  )
}
