const { normalizeCommandArgs } = require('@mpxjs/cli-shared-utils')
const { serveWeb } = require('@mpxjs/vue-cli-plugin-mpx/commands/serve/web')
const { serveServer } = require('./serveServer')
const { addBaseWebpackConfig } = require('../../config/base.config')
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

      const getBaseConfig = (ssrMode) => {
        const isServer = ssrMode === 'server'
        const port = options.pluginOptions?.SSR?.devClientPort || defaults.port
        options.publicPath = isServer ? '/' : `http://localhost:${port}/`
        api.chainWebpack((config) => {
          addBaseWebpackConfig(api, options, args, config, { ssrMode })
          addServeWebpackConfig(api, options, args, config, { ssrMode })
        })
      }

      const buildService = (ssrMode) => {
        return new Promise((resolve, reject) => {
          getBaseConfig(ssrMode)
          if (ssrMode === 'client') {
            serveWeb(api, options, args).then((...res) => {
              resolve(...res)
            }).catch(reject)
          } else {
            serveServer(api, options, args).then((...res) => {
              resolve(...res)
            }).catch(reject)
          }
        })
      }

      Promise.all([buildService('client'), buildService('server')])
    }
  )
}
