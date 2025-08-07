const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const webpack = require('webpack')

module.exports.addBaseWebpackConfig = function (api, options = {}, args, config, compilerConfig) {
  const isServer = compilerConfig.ssrMode === 'server'

  config.target(isServer ? 'node' : 'web')

  config.output
    .libraryTarget(isServer ? 'commonjs2' : undefined)

  if (isServer) {
    config.optimization.splitChunks(false)
  }

  config
    .plugin(`${isServer ? 'server-plugin' : 'client-plugin'}`)
    .use(isServer ? VueSSRServerPlugin : VueSSRClientPlugin)

  // 添加环境变量标识是否为 server 构建
  config.plugin('define').use(webpack.DefinePlugin, [{
    'SSR_BUILD_MODE': JSON.stringify(compilerConfig.ssrMode)
  }])

}
