const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { logWithSpinner, stopSpinner } = require('@vue/cli-shared-utils')
const execa = require('execa')
const { getTargets } = require('../utils/index')
const {
  resolveWebpackConfigByTargets,
  runWebpack,
  removeArgv
} = require('../utils/webpack')

const mpxCliServiceBinPath = require.resolve(
  '@mpxjs/mpx-cli-service/bin/mpx-cli-service.js'
)

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
      const openChildProcess = !!args['open-child-process']

      const showLoading = () =>
        logWithSpinner(
          '⚓',
          `Building for ${mode} of ${targets.map((v) => v.mode).join(',')}...`
        )

      if (openChildProcess && targets.length > 1) {
        showLoading()
        return Promise.all(
          targets.map((target) => {
            return execa('node', [
              mpxCliServiceBinPath,
              'build:mp',
              ...removeArgv(rawArgv, '--targets'),
              `--targets=${target.mode}:${target.env}`
            ])
          })
        ).then((results) => {
          stopSpinner()
          console.log(results.map(({ stdout }) => stdout).join('\n'))
        })
      }

      if (!openChildProcess) showLoading()

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
