module.exports.addBuildWebpackConfig = function (api, options = {}, args, config, compilerConfig) {
  const isServer = compilerConfig.ssrMode === 'server'

  config.cache({
    ...config.get('cache'),
    name: isServer ? 'build-serverBundleCache' : 'build-clientBundleCache'
  })
}
