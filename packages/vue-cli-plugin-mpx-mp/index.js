const registerCommand = require('./commands/mp')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { webpack } = require('webpack')
const { resolveMpxLoader } = require('@mpxjs/vue-cli-plugin-mpx')

module.exports = function (api, options) {
  api.chainWebpack((webpackConfig) => {
    webpackConfig.performance.hints(false)

    const mpxLoader = resolveMpxLoader(api, options)
    const wxmlLoader = MpxWebpackPlugin.wxmlLoader()
    const wxssLoader = MpxWebpackPlugin.wxssLoader()

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
      .loader(wxmlLoader.loader)
      .options(wxmlLoader.options)

    function createCSSRule(rule, test, loader, loaderOptions) {
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
    createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', {
      stylusOptions: {
        resolveUrl: true
      }
    })
    createCSSRule('less', /\.less$/, 'less-loader')
    createCSSRule('sass', /\.sass$/, 'sass-loader')
    createCSSRule('scss', /\.scss$/)
  })

  registerCommand(api, options, 'serve:mp')
  registerCommand(api, options, 'build:mp')
}

module.exports.defaultModes = {
  'serve:mp': 'none',
  'build:mp': 'production'
}

module.exports.platform = 'mp'
