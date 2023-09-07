const { toString } = require('webpack-chain')
const { highlight } = require('cli-highlight')
const { getTargets, getCurrentTarget } = require('@mpxjs/cli-shared')
const { resolveMpBuildWebpackConfig } = require('./build/mp')
const { resolveWebBuildWebpackConfig } = require('./build/web')

module.exports.registerInspectCommand = function registerInspectCommand (
  api,
  options
) {
  function inspectMp (args) {
    const target = getCurrentTarget()
    const { verbose } = args
    if (target.env) process.env.NODE_ENV = target.env
    const res = resolveMpBuildWebpackConfig(api, options, args)
    const output = toString(res, { verbose })
    console.log(highlight(output, { language: 'js' }))
  }
  function inspectWeb (args) {
    const target = getCurrentTarget()
    const { verbose } = args
    if (target.env) process.env.NODE_ENV = target.env
    const res = resolveWebBuildWebpackConfig(api, options, args)
    const output = toString(res, { verbose })
    console.log(highlight(output, { language: 'js' }))
  }
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
        if (target.mode === 'web') {
          inspectWeb(args)
        } else {
          inspectMp(args)
        }
      }
    }
  )
}
