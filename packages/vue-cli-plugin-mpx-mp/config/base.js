const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxLoader } = require('@mpxjs/vue-cli-plugin-mpx')
const webpack = require('webpack')
const { getMpxPluginOptions } = require('../utils')
const { WebpackMpResultPlugin } = require('../utils/webpackMpResultPlugin')

/**
 * 基础配置
 * @param {import('@vue/cli-service').PluginAPI} api
 * @param {import('@vue/cli-service').ProjectOptions} options
 * @returns
 */
module.exports = function resolveMpBaseWebpackConfig (
  api,
  options,
  webpackConfig
) {
  const mpxLoader = resolveMpxLoader(api, options)
  const wxmlLoader = MpxWebpackPlugin.wxmlLoader()
  const wxssLoader = MpxWebpackPlugin.wxssLoader()
  const mpxPluginOptions = getMpxPluginOptions(options)
  const mpxUrlLoader = MpxWebpackPlugin.urlLoader(
    mpxPluginOptions.urlLoader || {
      name: 'img/[name][hash].[ext]'
    }
  )

  webpackConfig
    .mode(process.env.NODE_ENV === 'production' ? 'production' : 'none')
    .context(api.service.context)
  webpackConfig.performance.hints(false)
  webpackConfig.output.clear() // 清除 cli-service 内部的 output 配置，避免 @mpxjs/webpack-plugin 出现 warning

  // alias config
  webpackConfig.resolve.alias.set('@', api.resolve('src'))

  // defind config
  webpackConfig.plugin('mpx-provide-plugin').use(webpack.ProvidePlugin, [
    {
      process: 'process/browser'
    }
  ])
  webpackConfig.plugin('define').use(webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
    }
  ])
  webpackConfig.plugin('webpack-mp-result-plugin').use(WebpackMpResultPlugin)

  // assets rules
  webpackConfig.module.rules.delete('svg')
  webpackConfig.module.rules.delete('images')
  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|svg)$/)
    .use('mpx-url-loader')
    .loader(require.resolve(mpxUrlLoader.loader))
    .options(mpxUrlLoader.options)

  // mpx rules

  webpackConfig.module
    .rule('mpx')
    .test(/\.mpx$/)
    .use('mpx-loader')
    .loader(require.resolve(mpxLoader.loader))
    .options(mpxLoader.options)

  // css rules
  webpackConfig.module
    .rule('wxml')
    .test(/\.(wxml|axml|swan|qml|ttml|qxml|jxml|ddml)$/)
    .use('mpx-wxml-loader')
    .loader(require.resolve(wxmlLoader.loader))
    .options(wxmlLoader.options)

  function createCSSRule (rule, test, loader, loaderOptions) {
    let chain = webpackConfig.module
      .rule(rule)
      .test(test)
      .use('mpx-wxss-loader')
      .loader(require.resolve(wxssLoader.loader))
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

  createCSSRule('wxss', /\.(wxss|acss|css|qss|ttss|jxss|ddss)$/)
  createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader')
  createCSSRule('less', /\.less$/, 'less-loader')
  createCSSRule('sass', /\.sass$/, 'sass-loader')
  createCSSRule('scss', /\.scss$/, 'sass-loader')

  // forked from vue-cli base config
  // Other common pre-processors ---------------------------------------------
  const maybeResolve = (name) => {
    try {
      return require.resolve(name)
    } catch (error) {
      return name
    }
  }

  webpackConfig.module
    .rule('pug')
    .test(/\.pug$/)
    .use('wxml-loader')
    .loader(require.resolve(wxmlLoader.loader))
    .options(wxmlLoader.options)
    .end()
    .use('pug-plain-loader')
    .loader(maybeResolve('pug-plain-loader'))
    .end()

  // friendly error plugin displays very confusing errors when webpack
  // fails to resolve a loader, so we provide custom handlers to improve it
  const {
    transformer,
    formatter
  } = require('@vue/cli-service/lib/util/resolveLoaderError')
  webpackConfig
    .plugin('friendly-errors')
    .use(require('@soda/friendly-errors-webpack-plugin'), [
      {
        additionalTransformers: [transformer],
        additionalFormatters: [formatter]
      }
    ])

  // forked end ---------------------------------------------

  return webpackConfig
}
