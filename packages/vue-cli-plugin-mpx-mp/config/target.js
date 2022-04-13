const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('@mpxjs/vue-cli-plugin-mpx')
const path = require('path')
const { getMpxPluginOptions } = require('../utils')

module.exports = function resolveTargetConfig (
  api,
  options = {},
  webpackConfig,
  target
) {
  const mpxOptions = getMpxPluginOptions(options)
  let outputDist = `dist/${target}`
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

  webpackConfig.name(`${target}-compiler`)

  webpackConfig.output.path(api.resolve(outputDist))

  webpackConfig.plugin('mpx-mp-copy-webpack-plugin').use(CopyWebpackPlugin, [
    {
      patterns: [
        {
          context: api.resolve(`static/${target}`),
          from: '**/*',
          to: subDir ? '..' : '',
          noErrorOnMissing: true
        }
      ]
    }
  ])

  webpackConfig.plugin('mpx-clean-webpack-plugin').use(CleanWebpackPlugin, [])

  webpackConfig.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [
    {
      target,
      srcMode: mpxOptions.srcMode,
      ...resolveMpxWebpackPluginConf(api, options)
    }
  ])
}
