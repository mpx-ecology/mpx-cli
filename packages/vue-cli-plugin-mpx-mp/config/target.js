const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('@mpxjs/vue-cli-plugin-mpx')
const path = require('path')
const { getMpxPluginOptions } = require('../utils')

/**
 * target相关配置
 * @param {*} api
 * @param {*} options
 * @param {*} webpackConfig
 * @param {*} target
 */
function resolveTargetConfig (
  api,
  options = {},
  webpackConfig,
  target
) {
  const mpxOptions = getMpxPluginOptions(options)
  let outputDist = `dist/${target.mode}`
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

  webpackConfig.name(`${target.mode}-compiler`)

  webpackConfig.output.path(api.resolve(outputDist))

  webpackConfig.plugin('mpx-mp-copy-webpack-plugin').use(CopyWebpackPlugin, [
    {
      patterns: [
        {
          context: api.resolve(`static/${target.mode}`),
          from: '**/*',
          to: subDir ? '..' : '',
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
}

function processTargetConfig (api, options, webpackConfig, target) {
  webpackConfig.output.clean = true
  webpackConfig.snapShot = {
    managedPaths: [api.resolve('node_modules/')]
  }
}

module.exports.processTargetConfig = processTargetConfig
module.exports.resolveTargetConfig = resolveTargetConfig
