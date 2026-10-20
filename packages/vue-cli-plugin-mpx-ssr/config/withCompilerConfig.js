const { addBaseWebpackConfig } = require('./base.config')

// client/server 共用 Service，但各自的配置回调不能留给下一次构建。
module.exports = async function withCompilerConfig (api, options, args, ssrMode, configure, run) {
  const service = api.service
  const chainFns = service.webpackChainFns
  const rawFns = service.webpackRawConfigFns
  const chainPromises = service.webpackChainPromises
  const publicPath = options.publicPath

  service.webpackChainFns = chainFns.slice()
  service.webpackRawConfigFns = rawFns.slice()
  service.webpackChainPromises = []
  try {
    api.chainWebpack((config) => {
      addBaseWebpackConfig(api, options, args, config, { ssrMode })
      configure(api, options, args, config, { ssrMode })
    })
    return await run()
  } finally {
    service.webpackChainFns = chainFns
    service.webpackRawConfigFns = rawFns
    if (chainPromises === undefined) delete service.webpackChainPromises
    else service.webpackChainPromises = chainPromises
    if (publicPath === undefined) delete options.publicPath
    else options.publicPath = publicPath
  }
}
