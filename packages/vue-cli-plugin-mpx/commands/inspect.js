const { toString } = require('webpack-chain')
const { highlight } = require('cli-highlight')
const {
  getTargets,
  getCurrentTarget,
  runServiceCommand
} = require('../utils/index')
const { resolveMpBuildWebpackConfig } = require('./build/mp')
const { resolveWebBuildWebpackConfig } = require('./build/web')

module.exports.registerInspectCommand = function registerInspectCommand (
  api,
  options
) {
  api.registerCommand(
    'inspect:mp',
    {
      description: 'inspect',
      usage: 'mpx-cli-service inspect:mp'
    },
    (args, rawArgs) => {
      const target = getCurrentTarget()
      if ((args.targets && !target.mode) || !target.mode) {
        return api.service.commands.inspect.fn(args, rawArgs)
      }
      const { verbose } = args
      if (target.env) process.env.NODE_ENV = target.env
      const res =
        target.mode === 'web'
          ? resolveWebBuildWebpackConfig(api, options, {
            ...args,
            target: `${target.mode}:${target.env}`
          })
          : resolveMpBuildWebpackConfig(api, options, {
            ...args,
            target: `${target.mode}:${target.env}`
          })
      const output = toString(res, { verbose })
      console.log(highlight(output, { language: 'js' }))
    }
  )
  api.registerCommand(
    'inspect:web',
    {
      description: 'inspect',
      usage: 'mpx-cli-service inspect:web'
    },
    (args, rawArgs) => {
      return api.service.commands.inspect.fn({ args, targets: 'web' }, [...rawArgs, '--targets=web'])
    }
  )
  api.registerCommand(
    'inspect',
    {
      description: 'inspect',
      usage: 'mpx-cli-service inspect'
    },
    async function inspect (args, rawArgs) {
      const targets = getTargets(args, options)
      // 小程序业务代码构建配置
      for (const target of targets) {
        await runServiceCommand('inspect:mp', rawArgs, {
          env: {
            ...process.env,
            FORCE_COLOR: true,
            MPX_CURRENT_TARGET_MODE: target.mode,
            MPX_CURRENT_TARGET_ENV: target.env,
            NODE_ENV: undefined
          },
          stdio: 'inherit'
        })
      }
    }
  )
}
