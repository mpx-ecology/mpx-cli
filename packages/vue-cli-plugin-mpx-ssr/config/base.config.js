const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const webpack = require('webpack')

module.exports.addBaseWebpackConfig = function (api, options = {}, args, config, compilerConfig) {
  const isServer = compilerConfig.ssrMode === 'server'

  process.env.MPX_SSR_BUILD_MODE = compilerConfig.ssrMode

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
