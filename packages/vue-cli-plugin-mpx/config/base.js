const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

module.exports = function (api, options, webpackConfig) {
  webpackConfig.module
    .rule('json')
    .test(/\.json$/)
    .resourceQuery(/__component/)
    .type('javascript/auto')

  webpackConfig.module
    .rule('wxs-pre-loader')
    .test(/\.(wxs|qs|sjs|filter\.js)$/)
    .pre()
    .use('mpx-wxs-pre-loader')
    .loader(MpxWebpackPlugin.wxsPreLoader().loader)

  webpackConfig.module.rules.delete('images')
  const mpxUrlLoader = MpxWebpackPlugin.urlLoader({
    name: 'img/[name][hash].[ext]'
  })
  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|svg)$/)
    .use('mpx-url-loader')
    .loader(mpxUrlLoader.loader)
    .options(mpxUrlLoader.options)

  webpackConfig.module
    .rule('js')
    .test(/\.js$/)
    .include
      .add(api.resolve('src'))
      .add(api.resolve('node_modules/@mpxjs'))
      .add(api.resolve('test'))
        .end()
    .use('babel-loader')
      .loader('babel-loader')

  webpackConfig.resolve.extensions
    .add('.mpx')
    .add('.wxml')
    .add('.ts')
    .add('.js')

  webpackConfig.resolve.modules.add('node_modules')
}
