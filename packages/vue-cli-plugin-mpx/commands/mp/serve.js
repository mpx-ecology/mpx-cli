const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const { getTargets } = require('../../../vue-cli-plugin-mpx-mp/utils/index')
const { symLinkTargetConfig } = require('../../../vue-cli-plugin-mpx-mp/utils/symlinkTargetConfig')
const {
  resolveWebpackConfigByTargets,
  runWebpack,
  runWebpackInChildProcess
} = require('../../../vue-cli-plugin-mpx-mp/utils/webpack')

module.exports = function registerServeCommand (api, options) {
  api.registerCommand(
    'serve:mp',
    {
      description: 'mp development',
      usage: 'mpx-cli-service serve:mp',
      options: {
        '--targets': `compile for target platform, support ${MODE.SUPPORT_MODE}`,
        '--open-child-process': 'open child process',
        '--env': 'custom define __mpx_env__'
      }
    },
    function (args, rawArgv) {
      const mode = api.service.mode
      const customMpxEnv = args.env
      const targets = getTargets(args, options)
      const openChildProcess =
        !!args['open-child-process'] && targets.length > 1

      logWithSpinner(
        '⚓',
        `Building for ${mode} of ${targets.map((v) => v.mode).join(',')}...`
      )

      if (openChildProcess) {
        return runWebpackInChildProcess('serve:mp', rawArgv, {
          targets,
          watch: true
        })
      }

      // 小程序业务代码构建配置
      const webpackConfigs = resolveWebpackConfigByTargets(
        api,
        options,
        targets,
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
      return runWebpack(webpackConfigs, {
        watch: true
      }).then((res) => {
        symLinkTargetConfig(api, targets, webpackConfigs)
        return res
      })
    }
  )
}
