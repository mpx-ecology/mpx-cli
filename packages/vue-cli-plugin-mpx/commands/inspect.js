const { toString } = require('webpack-chain')
const { highlight } = require('cli-highlight')
const { getTargets } = require('../utils/index')
const { resolveMpBuildWebpackConfig } = require('./build/mp')
const { resolveWebBuildWebpackConfig } = require('./build/web')

module.exports.registerInspectCommand = function registerInspectCommand (
  api,
  options
) {
  function inspect (args) {
    const targets = getTargets(args, options)
    const { verbose } = args

    // 小程序业务代码构建配置
    const res = targets.map((target) => {
      process.env.MPX_CURRENT_TARGET_MODE = target.mode
      process.env.MPX_CURRENT_TARGET_ENV = target.env
      if (target.env) process.env.NODE_ENV = target.env
      return target.mode === 'web'
        ? resolveWebBuildWebpackConfig(api, options, {
          ...args,
          target: `${target.mode}:${target.env}`
        })
        : resolveMpBuildWebpackConfig(api, options, {
          ...args,
          target: `${target.mode}:${target.env}`
        })
    })
    const output = toString(res, { verbose })
    console.log(highlight(output, { language: 'js' }))
  }
  api.registerCommand(
    'inspect',
    {
      description: 'inspect',
      usage: 'mpx-cli-service inspect'
    },
    inspect
  )
  api.registerCommand(
    'inspect:mp',
    {
      description: 'inspect',
      usage: 'mpx-cli-service inspect:mp'
    },
    inspect
  )
  api.registerCommand(
    'inspect:web',
    {
      description: 'inspect',
      usage: 'mpx-cli-service inspect:web'
    },
    (args, rawArgs) => {
      inspect(
        {
          ...args,
          targets: 'web'
        },
        [...rawArgs, '--targets=web']
      )
    }
  )
}
