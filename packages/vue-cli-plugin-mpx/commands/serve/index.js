const { SUPPORT_MODE } = require('@mpxjs/cli-shared-utils')
const { serveWeb } = require('./web')
const { serveMp } = require('./mp')

module.exports.registerServeCommand = function (api, options) {
  api.registerCommand(
    'serve',
    {
      description: 'mpx development',
      usage: 'mpx-cli-service serve',
      options: {
        '--targets': `compile for target platform, support ${SUPPORT_MODE}`,
        '--report': 'generate report.html to help analyze bundle content',
        '--mode': 'specify env mode (default: development)',
        '--env': 'custom define __mpx_env__'
      }
    },
    function build (args, rawArgv) {
      const target = api.service.target
      // 利用子进程转发构建
      return target.mode === 'web'
        ? serveWeb(api, options, args)
        : serveMp(api, options, args)
    }
  )
}
