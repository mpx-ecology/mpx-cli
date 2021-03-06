const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('@mpxjs/vue-cli-plugin-mpx')
const path = require('path')

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
      subDir = projectConfigJson.cloudfunctionRoot || projectConfigJson.pluginRoot
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

  webpackConfig.plugin('mpx-mp-copy-webpack-plugin').use(CopyWebpackPlugin, [
    [
      {
        context: api.resolve(`static/${mode}`),
        from: '**/*',
        to: subDir ? '..' : ''
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
