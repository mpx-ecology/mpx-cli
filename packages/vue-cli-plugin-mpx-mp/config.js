const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('@mpxjs/vue-cli-plugin-mpx')
const path = require('path')
const { resolveMpxLoader } = require('@mpxjs/vue-cli-plugin-mpx')

module.exports = function (
  api,
  options = {},
  webpackConfig,
  args,
  srcMode,
  mode
) {
  const isWatching = !!args.watch
  const isCompileProd = !!args.production

  let outputDist = `dist/${mode}`
  let subDir = ''
  if (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode')) {
    try {
      const projectConfigJson = require(api.resolve(
        'static/wx/project.config.json'
      ))
      outputDist = path.join(outputDist, projectConfigJson.miniprogramRoot)
      subDir =
        projectConfigJson.cloudfunctionRoot || projectConfigJson.pluginRoot
    } catch (e) {}
  }

  webpackConfig.name(`${mode}-compiler`)
  webpackConfig.devtool(isWatching ? 'source-map' : false)
  webpackConfig.mode(isCompileProd ? 'production' : 'none')

  webpackConfig.output.clear() // 清除 cli-service 内部的 output 配置，避免 @mpxjs/webpack-plugin 出现 warning
  webpackConfig.output.path(api.resolve(outputDist))

  webpackConfig.plugin('define-plugin').use(webpack.DefinePlugin, [
    {
      'process.env': {
        NODE_ENV: isWatching ? '"development"' : '"production"'
      }
    }
  ])

  // TODO: 路径问题
  webpackConfig.plugin('mpx-mp-copy-webpack-plugin').use(CopyWebpackPlugin, [
    {
      patterns: [
        {
          context: api.resolve(`static/${mode}`),
          from: '**/*',
          to: subDir ? '..' : ''
        }
      ]
    }
  ])

  webpackConfig.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [
    {
      mode,
      srcMode,
      forceDisableBuiltInLoader: true,
      ...resolveMpxWebpackPluginConf(api, options)
    }
  ])

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
    .oneOf('normal')
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('stylus-loader')
    .loader('stylus-loader')
    .options({
      'resolve url': true
    })

  webpackConfig.module.rule('less').oneOfs.delete('normal')

  webpackConfig.module
    .rule('less')
    .oneOf('normal')
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('less-loader')
    .loader('less-loader')

  webpackConfig.module.rule('sass').oneOfs.delete('normal')

  webpackConfig.module
    .rule('sass')
    .oneOf('normal')
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('sass-loader')
    .loader('sass-loader')

  webpackConfig.module.rule('scss').oneOfs.delete('normal')

  webpackConfig.module
    .rule('scss')
    .oneOf('normal')
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('sass-loader')
    .loader('sass-loader')

  if (args.report) {
    webpackConfig
      .plugin('bundle-analyzer-plugin')
      .use(BundleAnalyzerPlugin, [{}])
  }
}
