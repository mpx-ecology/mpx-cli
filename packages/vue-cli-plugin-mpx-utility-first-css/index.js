const MpxUnocssPlugin = require('@mpxjs/unocss-plugin')

module.exports = function (api, options) {
  const unocssOptions = options?.pluginOptions?.mpx?.unocss

  api.chainWebpack(webpackConfig => {
    webpackConfig.plugin('mpx-unocss-plugin').use(MpxUnocssPlugin, [unocssOptions])
  })
}
