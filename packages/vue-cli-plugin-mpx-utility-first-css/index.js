const MpxUnocssPluginModule = require('@mpxjs/unocss-plugin')
const MpxUnocssPlugin = MpxUnocssPluginModule.default || MpxUnocssPluginModule

module.exports = function (api, options) {
  const unocssOptions = options?.pluginOptions?.mpx?.unocss

  api.chainWebpack(webpackConfig => {
    webpackConfig.plugin('mpx-unocss-plugin').use(MpxUnocssPlugin, [unocssOptions])
  })
}
