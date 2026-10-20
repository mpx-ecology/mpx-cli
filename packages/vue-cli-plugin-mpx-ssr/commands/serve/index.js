const { normalizeCommandArgs } = require('@mpxjs/cli-shared-utils')
const { serveWeb } = require('@mpxjs/vue-cli-plugin-mpx/commands/serve/web')
const { serveServer } = require('./serveServer')
const withCompilerConfig = require('../../config/withCompilerConfig')
const { addServeWebpackConfig } = require('../../config/serve.config')

const defaults = {
  port: 3000
}

module.exports.registerServeCommand = function (api, options) {
  api.registerCommand(
    'serve:ssr',
    {
      description: 'mpx development',
      usage: 'mpx-cli-service serve ssr'
    },
    async function build (args) {
      normalizeCommandArgs(args, defaults)

      const buildService = (ssrMode) => withCompilerConfig(api, options, args, ssrMode, addServeWebpackConfig, async () => {
        const isServer = ssrMode === 'server'
        const port = options.pluginOptions?.SSR?.devClientPort || defaults.port
        options.publicPath = isServer ? '/' : `http://localhost:${port}/`
        return isServer ? serveServer(api, options, args) : serveWeb(api, options, args)
      })
      await buildService('client')
      await buildService('server')
    }
  )
}
