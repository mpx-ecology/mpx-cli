const { getCurrentTarget, SUPPORT_MODE } = require('@mpxjs/cli-shared-utils')
const { buildMp } = require('./mp')
const { buildWeb } = require('./web')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.registerBuildCommand = function (api, options) {
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
      const target = getCurrentTarget()
      return target.mode === 'web'
        ? buildWeb(api, options, args)
        : buildMp(api, options, args)
    }
  )
}
