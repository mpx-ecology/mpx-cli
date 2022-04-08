const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('@mpxjs/vue-cli-plugin-mpx')
const path = require('path')
const { getMpxPluginOptions } = require('./utils')
module.exports = function (api, options = {}, webpackConfig, mode) {
  const mpxOptions = getMpxPluginOptions(options)
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

  webpackConfig.output.path(api.resolve(outputDist))

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
      srcMode: mpxOptions.srcMode,
      ...resolveMpxWebpackPluginConf(api, options)
    }
  ])
}
