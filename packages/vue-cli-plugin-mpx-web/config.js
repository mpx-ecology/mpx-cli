const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const {
  transformMpxEntry,
  resolveMpxLoader,
  resolveMpxWebpackPluginConf
} = require('vue-cli-plugin-mpx')

module.exports = function (api, options = {}) {
  api.chainWebpack((webpackConfig) => {
    // TODO: vue.config.js 多入口的场景配置
    const isWeb = true
    transformMpxEntry(api, options, webpackConfig, isWeb)

    const mpxLoader = resolveMpxLoader(api, options)
    webpackConfig.module
      .rule('mpx')
      .test(/\.mpx$/)
        .use('vue-loader')
          .loader('vue-loader')
          .end()
        .use('mpx-loader')
          .loader(mpxLoader.loader)
          .options(mpxLoader.options)

    // 直接更新 vue-cli-service 内部的 vue-loader options 配置
    webpackConfig.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) =>
        Object.assign(options, {
          transformAssetUrls: {
            'mpx-image': 'src',
            'mpx-audio': 'src',
            'mpx-video': 'src'
          }
        })
      )

    webpackConfig.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [
      {
        mode: 'web',
        srcMode: 'wx',
        forceDisableBuiltInLoader: true,
        ...resolveMpxWebpackPluginConf(api, options)
      }
    ])
  })
}
