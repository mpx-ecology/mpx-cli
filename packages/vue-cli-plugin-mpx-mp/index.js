const registerCommand = require('./commands/mp')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxLoader } = require('@mpxjs/vue-cli-plugin-mpx')
const { webpack } = require('webpack')

module.exports = function (api, options) {
  api.chainWebpack((webpackConfig) => {
    webpackConfig.cache(true)
    webpackConfig.performance.hints(false)

    const mpxLoader = resolveMpxLoader(api, options)

    webpackConfig.module
      .rule('mpx')
      .test(/\.mpx$/)
      .use('mpx-loader')
      .loader(mpxLoader.loader)
      .options(mpxLoader.options)

    webpackConfig.module
      .rule('wxml')
      .test(/\.(wxml|axml|swan|qml|ttml|qxml|jxml|ddml)$/)
      .use('wxml')
      .loader('html-loader')

    webpackConfig.module
      .rule('wxss')
      .test(/\.(wxss|acss|css|qss|ttss|jxss|ddss)$/)
      .use('wxss')
      .loader('css-loader')

    webpackConfig.module.rule('stylus').oneOfs.delete('normal')

    webpackConfig.module
      .rule('stylus')
      .test(/\.styl(us)?$/)
      .use('css-loader')
      .loader('css-loader')
      .end()
      .use('stylus-loader')
      .loader('stylus-loader')
  })

  registerCommand(api, options, 'serve:mp')
  registerCommand(api, options, 'build:mp')
}

module.exports.defaultModes = {
  'serve:mp': 'none',
  'build:mp': 'production'
}

module.exports.platform = 'mp'
