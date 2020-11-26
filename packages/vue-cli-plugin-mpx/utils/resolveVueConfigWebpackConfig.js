const Config = require('webpack-chain')
const merge = require('webpack-merge')

module.exports = function resolveVueConfigWebpackConfig(api, options) {
  let config = new Config()
  let vueConfWebpackChainFn
  let vueConfWebpackConfigureFn

  // api.service.webpackChainFns 最后一项为 vue.config.js 用户配置
  if (options.chainWebpack) {
    vueConfWebpackChainFn = api.service.webpackChainFns && api.service.webpackChainFns.pop()
    vueConfWebpackChainFn(config)
  }

  config = config.toConfig()

  // api.service.configureWebpack 最后一项为 vue.config.js 用户配置
  if (options.configureWebpack) {
    vueConfWebpackConfigureFn = api.service.webpackRawConfigFns && api.service.webpackRawConfigFns.pop()

    if (typeof vueConfWebpackConfigureFn === 'function') {
      const res = vueConfWebpackConfigureFn(config)
      if (res) config = merge(config, res)
    } else if (vueConfWebpackConfigureFn) {
      config = merge(config, vueConfWebpackConfigureFn)
    }
  }

  return config
}
