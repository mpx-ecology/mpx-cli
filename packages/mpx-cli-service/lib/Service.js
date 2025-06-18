const Service = require('@vue/cli-service')
const { getServerBundle } = require('@mpxjs/cli-shared-utils')
const Config = require('webpack-chain')
const PluginAPI = require('@vue/cli-service/lib/PluginAPI')

process.env.VUE_CLI_SERVICE_CONFIG_PATH = 'mpx.config.js'

Service.prototype.resolveChainableWebpackConfig = function () {
  const chainableConfig = new Config()
  // apply chains
  this.webpackChainFns.forEach(fn => {
    const res = fn(chainableConfig)
    if (res instanceof Promise) {
      this.webpackChainPromises = this.webpackChainPromises || []
      this.webpackChainPromises.push(res)
    }
  })
  return chainableConfig
}

const originResolveWebpackConfig = PluginAPI.prototype.resolveWebpackConfig
PluginAPI.prototype.resolveWebpackConfig = async function (chainableConfig) {
  chainableConfig = chainableConfig || this.resolveChainableWebpackConfig()
  if (this.service.webpackChainPromises) {
    await Promise.all(this.service.webpackChainPromises)
  }
  const res = originResolveWebpackConfig.call(this, chainableConfig)
  return res
}

module.exports = Service

module.exports.getServerBundle = getServerBundle
