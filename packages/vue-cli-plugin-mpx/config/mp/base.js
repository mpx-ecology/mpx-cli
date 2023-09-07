const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {
  MODE_CONFIG_FILES_MAP,
  SUPPORT_MODE
} = require('@mpxjs/cli-shared/constant')
const { getMpxPluginOptions } = require('@mpxjs/cli-shared')
const {
  resolveMpxWebpackPluginConf
} = require('../resolveMpxWebpackPluginConf')
const { resolveMpxLoader } = require('../../utils/resolveMpxLoader')
const { getReporter } = require('../../utils/reporter')
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
  const mpxOptions = getMpxPluginOptions(options)
  let outputDir =
    options.outputDir !== 'dist' ? options.outputDir : `dist/${target.mode}`
  let subDir = ''

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
      name: `${process.env.MPX_CURRENT_TARGET_MODE}-compiler-${api.service.mode}`,
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
  createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', {
    stylusOptions: {
      compress: false
    }
  })
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

  if (
    target.mode === 'wx' &&
    (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode'))
  ) {
    try {
      const projectConfigJson = require(api.resolve(
        'static/wx/project.config.json'
      ))
      outputDir = path.join(outputDir, projectConfigJson.miniprogramRoot)
      subDir =
        projectConfigJson.cloudfunctionRoot || projectConfigJson.pluginRoot
    } catch (e) {}
  }

  webpackConfig.output.path(api.resolve(outputDir))

  webpackConfig.plugin('mpx-mp-copy-webpack-plugin').use(CopyWebpackPlugin, [
    {
      patterns: [
        {
          context: api.resolve(`static/${target.mode}`),
          from: '**/*',
          to: subDir ? '..' : '',
          globOptions: {
            ignore: MODE_CONFIG_FILES_MAP[target.mode] || []
          },
          noErrorOnMissing: true
        },
        {
          context: api.resolve('static'),
          from: '**/*',
          to: subDir ? '..' : '',
          globOptions: {
            ignore: SUPPORT_MODE.map((v) => `**/${v}/**`)
          },
          noErrorOnMissing: true
        }
      ]
    }
  ])

  webpackConfig.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [
    {
      mode: target.mode,
      srcMode: mpxOptions.srcMode,
      ...resolveMpxWebpackPluginConf(api, options)
    }
  ])

  webpackConfig.optimization.minimizer('mpx-terser').use(TerserPlugin, [
    {
      // terserOptions参考 https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
      terserOptions: {
        // terser的默认行为会把某些对象方法转为箭头函数，导致ios9等不支持箭头函数的环境白屏，详情见 https://github.com/terser/terser#compress-options
        compress: {
          arrows: false
        }
      }
    }
  ])

  webpackConfig.devtool(
    process.env.NODE_ENV === 'production' ? false : 'source-map'
  )
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
