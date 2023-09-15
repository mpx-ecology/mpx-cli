const { toString } = require('webpack-chain')
const { highlight } = require('cli-highlight')
const { resolveMpBuildWebpackConfig } = require('./build/mp')
const { resolveWebBuildWebpackConfig } = require('./build/web')

module.exports.registerInspectCommand = function registerInspectCommand (
  api,
  options
) {
  api.registerCommand(
    'inspect',
    {
      description: 'inspect',
      usage: 'mpx-cli-service inspect'
    },
    async function inspect (args) {
      const target = api.service.target
      const { verbose } = args
      if (target.env) process.env.NODE_ENV = target.env
      const res =
        target.mode === 'web'
          ? resolveWebBuildWebpackConfig(api, options, args)
          : resolveMpBuildWebpackConfig(api, options, args)
      const output = toString(res, { verbose })
      console.log(highlight(output, { language: 'js' }))
    }
  )
}
