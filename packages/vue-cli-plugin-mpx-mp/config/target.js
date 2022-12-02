const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('@mpxjs/vue-cli-plugin-mpx')
const path = require('path')
const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')
const { getMpxPluginOptions } = require('../utils')

const copyIgnoreArr = []

Object.values(MODE.MODE_CONFIG_FILES_MAP).forEach((configFiles) => {
  configFiles.forEach((v) => {
    copyIgnoreArr.push('**/' + v)
  })
})

/**
 * target相关配置
 * @param {*} api
 * @param {*} options
 * @param {*} webpackConfig
 * @param {*} target
 */
function resolveTargetConfig (api, options = {}, webpackConfig, target) {
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
          context: api.resolve('static'),
          from: '**/*',
          to: subDir ? '..' : '',
          globOptions: {
            ignore: copyIgnoreArr
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
}

function processTargetConfig (api, options, webpackConfig, target) {
  webpackConfig.output.clean =
    webpackConfig.output.clean === undefined ? true : webpackConfig.output.clean
  webpackConfig.snapshot = {
    managedPaths: [api.resolve('node_modules/')],
    ...webpackConfig.snapshot
  }
}

module.exports.processTargetConfig = processTargetConfig
module.exports.resolveTargetConfig = resolveTargetConfig
