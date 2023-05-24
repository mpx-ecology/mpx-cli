const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

module.exports.resolveMpxLoader = function (api, options = {}) {
  const mpxLoaderOptions =
    (options.pluginOptions &&
      options.pluginOptions.mpx &&
      options.pluginOptions.mpx.loader) ||
    {}

  const mpxLoaderConfig = Object.assign({
    ...mpxLoaderOptions,
    __foo__: 'bar' // options 如果仅传入一个 {}，在 webpack-chain 处理过程中忽略掉这个值，这里传入一个占位字段
  })

  return MpxWebpackPlugin.loader(mpxLoaderConfig)
}
