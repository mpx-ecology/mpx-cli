module.exports.addServeWebpackConfig = function (api, options = {}, args, config, compilerConfig) {
  const isServer = compilerConfig.ssrMode === 'server'

  config.cache({
    ...config.get('cache'),
    name: isServer ? 'dev-serverBundleCache' : 'dev-clientBundleCache'
  })

  config.devServer.port(options.pluginOptions?.SSR?.devClientPort || 3000)
}
