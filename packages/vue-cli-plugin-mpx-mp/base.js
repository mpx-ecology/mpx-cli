const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxLoader } = require('@mpxjs/vue-cli-plugin-mpx')
const webpack = require('webpack')
const { getMpxPluginOptions } = require('./utils')

module.exports = function resolveMpBaseWebpackConfig (api, options) {
  const webpackConfig = api.resolveChainableWebpackConfig()

  const mpxLoader = resolveMpxLoader(api, options)
  const wxmlLoader = MpxWebpackPlugin.wxmlLoader()
  const wxssLoader = MpxWebpackPlugin.wxssLoader()
  const mpxPluginOptions = getMpxPluginOptions(options)
  const mpxUrlLoader = MpxWebpackPlugin.urlLoader(
    mpxPluginOptions.urlLoader || {
      name: 'img/[name][hash].[ext]'
    }
  )

  function createCSSRule (rule, test, loader, loaderOptions) {
    let chain = webpackConfig.module
      .rule(rule)
      .test(test)
      .use('mpx-wxss-loader')
      .loader(wxssLoader.loader)
      .options(wxssLoader.options)
      .end()

    if (loader) {
      chain = chain.use(loader).loader(loader)
      if (loaderOptions) {
        chain.options(loaderOptions)
      }
    }
    return chain
  }

  webpackConfig.plugin('define-plugin').use(webpack.DefinePlugin, [
    {
      'process.env': {
        NODE_ENV: `"${process.env.NODE_ENV}"`
      }
    }
  ])
  webpackConfig.mode('development').context(api.service.context)
  webpackConfig.performance.hints(false)
  webpackConfig.output.clear() // 清除 cli-service 内部的 output 配置，避免 @mpxjs/webpack-plugin 出现 warning
  webpackConfig.module.rules.delete('images')
  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|svg)$/)
    .use('mpx-url-loader')
    .loader(mpxUrlLoader.loader)
    .options(mpxUrlLoader.options)

  webpackConfig.module
    .rule('mpx')
    .test(/\.mpx$/)
    .use('mpx-loader')
    .loader(mpxLoader.loader)
    .options(mpxLoader.options)

  webpackConfig.module
    .rule('wxml')
    .test(/\.(wxml|axml|swan|qml|ttml|qxml|jxml|ddml)$/)
    .use('mpx-wxml-loader')
    .loader(wxmlLoader.loader)
    .options(wxmlLoader.options)

  createCSSRule('wxss', /\.(wxss|acss|css|qss|ttss|jxss|ddss)$/)
  createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader')
  createCSSRule('less', /\.less$/, 'less-loader')
  createCSSRule('sass', /\.sass$/, 'sass-loader')
  createCSSRule('scss', /\.scss$/)

  return webpackConfig
}
