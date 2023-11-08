const { normalizeCommandArgs } = require('@mpxjs/cli-shared-utils')
const fs = require('fs-extra')
const { serveWeb } = require('../../../vue-cli-plugin-mpx/commands/serve/web')
const { serveServer } = require('./serveServer')
const { addServeWebpackConfig } = require('../../config/serve.config')

const defaults = {
  clean: true
}

module.exports.registerServeCommand = function (api, options) {
  api.registerCommand(
    'serve:ssr',
    {
      description: 'mpx development',
      usage: 'mpx-cli-service serve',
      options: {
        '--ssrMode': `compile for target environment, support client, server`,
        '--no-clean':
          'do not remove the dist directory contents before building the project',
      }
    },
    function build (args) {
      normalizeCommandArgs(args, defaults)
      if (args.clean) {
        fs.removeSync(options.outputDir)
      }
      if (options.outputDir === 'dist') {
        options.outputDir = 'dist/web'
      }
      const isServer = args.ssrMode === 'server'
      options.publicPath = isServer ? '/' : 'http://localhost:8081/'
      api.chainWebpack((config) => {
        addServeWebpackConfig(api, options, args, config)
      })
      if (!isServer) {
        return serveWeb(api, options, args)
      } else {
        return serveServer(api, options, args)
      }
    }
  )
}
