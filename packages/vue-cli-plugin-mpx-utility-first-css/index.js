const MpxWindicssPlugin = require('@mpxjs/windicss-plugin')

module.exports = function (api, options) {
  const mpxWindiPluginOptions = options?.pluginOptions?.mpx?.windiPlugin

  api.chainWebpack(webpackConfig => {
    webpackConfig.plugin('mpx-windicss-plugin').use(MpxWindicssPlugin, [mpxWindiPluginOptions])
  })
}
