const {
  transformMpxEntry
} = require('@mpxjs/vue-cli-plugin-mpx')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const path = require('path')

module.exports.addBuildWebpackConfig = function (api, options = {}, args, config) {
  const isServer = args.ssrMode === 'server'

  transformMpxEntry(api, options, config, true)

  config.target(isServer ? 'node' : 'web')

  config.cache({
    type: 'filesystem',
    name: isServer ? 'serverBundleCache' : 'clientBundleCache',
    cacheDirectory: path.resolve('.cache/')
  })

  config.output
    .libraryTarget(isServer ? 'commonjs2' : undefined)

  if (isServer) {
    config.optimization
      .splitChunks(false)
  }

  const dependenciesConfig = [api.resolve('vue.config.js')]

  const addDepConfig = (names = []) => {
    names.forEach((name) => {
      try {
        const pkgDir = path.resolve(require.resolve(name), '../') + '/'
        dependenciesConfig.push(pkgDir)
      } catch (error) {}
    })
  }

  addDepConfig([
    '@mpxjs/vue-cli-plugin-mpx',
    '@mpxjs/vue-cli-plugin-mpx-plugin-mode',
    '@mpxjs/vue-cli-plugin-mpx-typescript',
    '@mpxjs/vue-cli-plugin-mpx-eslint',
    '@mpxjs/vue-cli-plugin-mpx-cloud-func',
    '@mpxjs/vue-cli-plugin-mpx-ssr'
  ])

  config.cache({
    type: 'filesystem',
    buildDependencies: {
      config: dependenciesConfig
    },
    name: isServer ? 'serverBundleCache' : 'clientBundleCache',
    cacheDirectory: path.resolve('.cache/')
  })

  config
    .plugin(`${isServer ? 'server-plugin' : 'client-plugin'}`)
    .use(isServer ? VueSSRServerPlugin : VueSSRClientPlugin)
}
