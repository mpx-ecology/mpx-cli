const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const { resolveMpxLoader } = require('../../utils/resolveMpxLoader')
const { getMpxPluginOptions } = require('../../utils')
const { getReporter } = require('../../utils/reporter')
const { resolveMpTargetConfig } = require('./target')
const { transformMpxEntry } = require('../transformMpxEntry')

/**
 * 基础配置
 * @param {import('@vue/cli-service').PluginAPI} api
 * @param {import('@vue/cli-service').ProjectOptions} options
 * @returns
 */
module.exports.resolveMpWebpackConfig = function resolveMpWebpackConfig (
  api,
  options,
  webpackConfig,
  target
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

  webpackConfig.name(`${target.mode}-compiler`)

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
  // 和vue-cli保持同名，方便一次性修改mp和web版本的define参数
  webpackConfig.plugin('define').use(webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
    }
  ])
  // fancy reporter
  webpackConfig.plugin('webpackbar').use(WebpackBar, [
    {
      color: 'orange',
      name: process.env.MPX_CURRENT_TARGET_MODE + '-compiler',
      basic: false,
      reporter: getReporter()
    }
  ])

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
      .oneOf('mpx')
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

  // 根据不同target修改webpack配置
  resolveMpTargetConfig(api, options, webpackConfig, target)
  // 转换entry
  transformMpxEntry(api, options, webpackConfig)
  return webpackConfig
}

/**
 *
 * @param {import('@vue/cli-service').PluginAPI} api
 * @returns {import('@vue/cli-service').ProjectOptions['configureWebpack']}
 */
module.exports.resolveBaseRawWebpackConfig =
  function resolveBaseRawWebpackConfig (api) {
    return {
      output: {
        clean: true
      },
      snapshot: {
        managedPaths: [api.resolve('node_modules/')]
      },
      optimization: {
        emitOnErrors: true
      }
    }
  }
