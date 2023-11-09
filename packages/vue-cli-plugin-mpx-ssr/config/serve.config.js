const {
  transformMpxEntry
} = require('@mpxjs/vue-cli-plugin-mpx')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports.addServeWebpackConfig = function (api, options = {}, args, config) {
  const isServer = args.ssrMode === 'server'

  transformMpxEntry(api, options, config, true)

  config.devtool('source-map')

  config.target(isServer ? 'node' : 'web')

  config.output
    .libraryTarget(isServer ? 'commonjs2' : undefined)
  if (isServer) {
    config.optimization.splitChunks(false)
  }

  config
    .plugin(`${isServer ? 'server-plugin' : 'client-plugin'}`)
    .use(isServer ? VueSSRServerPlugin : VueSSRClientPlugin)
}
