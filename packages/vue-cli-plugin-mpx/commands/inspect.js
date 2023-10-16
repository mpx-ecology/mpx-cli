const { toString } = require('webpack-chain')
const { highlight } = require('cli-highlight')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const { resolveBuildWebpackConfig } = require('../config/base')
const { resolveBuildWebpackConfigByTarget } = require('../config')

/** @type {import('@vue/cli-service').ServicePlugin} */
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
      const { verbose } = args
      const target = getCurrentTarget()
      api.chainWebpack((config) =>
        resolveBuildWebpackConfig(api, options, config, target, args)
      )
      const res = resolveBuildWebpackConfigByTarget(api, options, target, args)
      const output = toString(res, { verbose })
      console.log(highlight(output, { language: 'js' }))
    }
  )
}
