const { SUPPORT_MODE } = require('../../constants/mode')
const { getTargets } = require('../../utils')
const { buildTargetInChildProcess } = require('../../utils/webpack')
const { registerMpBuildCommand } = require('./mp')
const { registerWebBuildCommand } = require('./web')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.registerBuildCommand = function (api, options) {
  registerMpBuildCommand(api, options)
  registerWebBuildCommand(api, options)
  api.registerCommand(
    'build',
    {
      description: 'mpx production',
      usage: 'mpx-cli-service build',
      options: {
        '--targets': `compile for target platform, support ${SUPPORT_MODE}`,
        '--watch': 'compile in watch mode',
        '--report': 'generate report.html to help analyze bundle content',
        '--env': 'custom define __mpx_env__'
      }
    },
    function build (args, rawArgv) {
      const targets = getTargets(args, options)
      // 利用子进程转发构建
      return Promise.all(
        targets.map((target) =>
          buildTargetInChildProcess(
            target.mode === 'web' ? 'build:web' : 'build:mp',
            target,
            rawArgv
          )
        )
      )
    }
  )
}
