const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const webpack = require('webpack')
const applyBaseMpxConfig = require('./base')
const resolveMpxLoader = require('../utils/resolveMpxLoader')
const resolveMpxWebpackPluginConf = require('../utils/resolveMpxWebpackPluginConf')

module.exports = function (
  api,
  options = {},
  webpackConfig,
  mode,
  isWatching,
  isCompileProd
) {
  const srcMode =
    options.pluginOptions &&
    options.pluginOptions.mpx &&
    options.pluginOptions.mpx.srcMode

  applyBaseMpxConfig(api, options, webpackConfig)

  const mpxLoader = resolveMpxLoader(api, options)
  webpackConfig.module
    .rule('mpx')
    .test(/\.mpx$/)
    .use('mpx-loader')
    .loader(mpxLoader.loader)
    .options(mpxLoader.options)

  webpackConfig.performance.hints(false)
  webpackConfig.devtool(isWatching ? 'source-map' : false)
  webpackConfig.mode(isCompileProd ? 'production' : 'none')

  webpackConfig.cache(true)

  webpackConfig.output.clear() // 清除 cli-service 内部的 output 配置，避免 @mpxjs/webpack-plugin 出现 warning
  webpackConfig.output.path(api.resolve(`dist/${mode}`))

  webpackConfig.plugin('copy-webpack-plugin').use(CopyWebpackPlugin, [
    [
      {
        context: api.resolve(`static/${mode}`),
        from: '**/*',
        to: ''
      }
    ]
  ])

  webpackConfig.plugin('define-plugin').use(webpack.DefinePlugin, [
    {
      'process.env': {
        NODE_ENV: isWatching ? '"development"' : '"production"'
      }
    }
  ])

  webpackConfig.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [
    {
      mode,
      srcMode,
      ...resolveMpxWebpackPluginConf(api, options)
    }
  ])

  return webpackConfig
}
