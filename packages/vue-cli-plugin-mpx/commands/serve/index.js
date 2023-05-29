const { SUPPORT_MODE } = require('../../constants/mode')
const { getTargets } = require('../../utils')
const { buildTargetInChildProcess } = require('../../utils/webpack')
const { registerMpServeCommand } = require('./mp')
const { registerWebServeCommand } = require('./web')

module.exports.registerServeCommand = function (api, options) {
  registerMpServeCommand(api, options)
  registerWebServeCommand(api, options)
  api.registerCommand(
    'serve',
    {
      description: 'mpx development',
      usage: 'mpx-cli-service serve',
      options: {
        '--targets': `compile for target platform, support ${SUPPORT_MODE}`,
        '--report': 'generate report.html to help analyze bundle content',
        '--env': 'custom define __mpx_env__'
      }
    },
    function build (args, rawArgv) {
      const targets = getTargets(args, options)
      return Promise.all(
        targets.map((target) =>
          buildTargetInChildProcess(
            target.mode === 'web' ? 'serve:web' : 'serve:mp',
            target,
            rawArgv
          )
        )
      )
    }
  )
}
