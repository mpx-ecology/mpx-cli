const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const {
  transformMpxEntry,
  resolveMpxLoader,
  resolveMpxWebpackPluginConf
} = require('@mpxjs/vue-cli-plugin-mpx')

module.exports = function (api, options = {}) {
  api.chainWebpack((webpackConfig) => {
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

    // 对于 svg 交给 mpx-url-loader 处理，去掉 vue-cli 配置的 svg 规则
    webpackConfig.module.rules.delete('svg')

    webpackConfig.module.rule('stylus').oneOfs.delete('normal')

    webpackConfig.module
      .rule('stylus')
      .oneOf('normal')
      .test(/\.styl(us)?$/)
      .use('vue-style-loader')
      .loader('vue-style-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .end()
      .use('stylus-loader')
      .loader('stylus-loader')
      .end()

    webpackConfig.module.rule('css').oneOfs.delete('normal')

    webpackConfig.module
      .rule('css')
      .oneOf('normal')
      .test(/\.css$/)
      .use('vue-style-loader')
      .loader('vue-style-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .end()

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
