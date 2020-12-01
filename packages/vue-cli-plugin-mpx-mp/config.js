const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('vue-cli-plugin-mpx')

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

  webpackConfig.devtool(isWatching ? 'source-map' : false)
  webpackConfig.mode(isCompileProd ? 'production' : 'none')

  webpackConfig.output.clear() // 清除 cli-service 内部的 output 配置，避免 @mpxjs/webpack-plugin 出现 warning
  webpackConfig.output.path(api.resolve(`dist/${mode}`))

  webpackConfig.plugin('define-plugin').use(webpack.DefinePlugin, [
    {
      'process.env': {
        NODE_ENV: isWatching ? '"development"' : '"production"'
      }
    }
  ])

  webpackConfig.plugin('mpx-mp-copy-webpack-plugin').use(CopyWebpackPlugin, [
    [
      {
        context: api.resolve(`static/${mode}`),
        from: '**/*',
        to: ''
      }
    ]
  ])

  webpackConfig.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [
    {
      mode,
      srcMode,
      ...resolveMpxWebpackPluginConf(api, options)
    }
  ])

  if (args.report) {
    webpackConfig
      .plugin('bundle-analyzer-plugin')
      .use(BundleAnalyzerPlugin, [{}])
  }
}
