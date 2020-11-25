module.exports = function(api, options) {
  api.isMpxCli = true

  // 获取 vue.config.js webpack 相关配置
  api.resolveVueConfigWebpackConfig = function() {
    const Config = require('webpack-chain')
    const merge = require('webpack-merge')

    let config = new Config()
    let vueConfWebpackChainFn
    let vueConfWebpackConfigureFn

    if (options.chainWebpack) {
      vueConfWebpackChainFn = api.service.webpackChainFns && api.service.webpackChainFns.pop()
      vueConfWebpackChainFn(config)
    }

    config = config.toConfig()

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
}
