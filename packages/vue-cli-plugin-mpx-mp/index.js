const webpack = require('webpack')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxLoader } = require('@mpxjs/vue-cli-plugin-mpx')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const minimist = require('minimist')
const registerCommand = require('./commands/mp')

module.exports = function (api, options) {
  const args = minimist(process.argv.slice(2))

  api.chainWebpack((webpackConfig) => {
    webpackConfig.performance.hints(false)

    const mpxLoader = resolveMpxLoader(api, options)
    const wxmlLoader = MpxWebpackPlugin.wxmlLoader()
    const wxssLoader = MpxWebpackPlugin.wxssLoader()
    const isWatching = !!args.watch
    const isCompileProd = !!args.production

    let imgLoaderConfig = {
      name: 'img/[name][hash].[ext]'
    }
    if (
      options &&
      options.pluginOptions &&
      options.pluginOptions.mpx &&
      options.pluginOptions.mpx.urlLoader
    ) {
      imgLoaderConfig = options.pluginOptions.mpx.urlLoader
    }
    const mpxUrlLoader = MpxWebpackPlugin.urlLoader(imgLoaderConfig)

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

    createCSSRule('wxss', /\.(wxss|acss|css|qss|ttss|jxss|ddss)$/)
    createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader')
    createCSSRule('less', /\.less$/, 'less-loader')
    createCSSRule('sass', /\.sass$/, 'sass-loader')
    createCSSRule('scss', /\.scss$/)

    webpackConfig.output.clear() // 清除 cli-service 内部的 output 配置，避免 @mpxjs/webpack-plugin 出现 warning

    webpackConfig.devtool(isWatching ? 'source-map' : false)
    webpackConfig.mode(isCompileProd ? 'production' : 'none')

    webpackConfig.plugin('define-plugin').use(webpack.DefinePlugin, [
      {
        'process.env': {
          NODE_ENV: isWatching ? '"development"' : '"production"'
        }
      }
    ])

    if (args.report) {
      webpackConfig
        .plugin('bundle-analyzer-plugin')
        .use(BundleAnalyzerPlugin, [{}])
    }
  })

  registerCommand(api, options, 'serve:mp')
  registerCommand(api, options, 'build:mp')
}

module.exports.defaultModes = {
  'serve:mp': 'none',
  'build:mp': 'production'
}

module.exports.platform = 'mp'
