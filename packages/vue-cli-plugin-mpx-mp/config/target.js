const CopyWebpackPlugin = require('copy-webpack-plugin')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolveMpxWebpackPluginConf } = require('@mpxjs/vue-cli-plugin-mpx')
const path = require('path')
const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')
const TerserPlugin = require('terser-webpack-plugin')
const { getMpxPluginOptions } = require('../utils')

const copyIgnoreArr = []

Object.values(MODE.MODE_CONFIG_FILES_MAP).forEach((configFiles) => {
  configFiles.forEach((v) => {
    copyIgnoreArr.push('**/' + v)
  })
})

/**
 * target相关配置
 * @param {import('@vue/cli-service').PluginAPI} api
 * @param {import('@vue/cli-service').ProjectOptions} options
 * @param {import('webpack-chain')} webpackConfig
 * @param {*} target
 */
function resolveTargetConfig (api, options = {}, webpackConfig, target) {
  const mpxOptions = getMpxPluginOptions(options)
  let outputDist = `dist/${target.mode}`
  let subDir = ''

  if (
    target.mode === 'wx' &&
    (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode'))
  ) {
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

  webpackConfig.optimization.minimizer('mpx-terser').use(TerserPlugin, [{
    // terserOptions参考 https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
    terserOptions: {
      // terser的默认行为会把某些对象方法转为箭头函数，导致ios9等不支持箭头函数的环境白屏，详情见 https://github.com/terser/terser#compress-options
      compress: {
        arrows: false
      }
    }
  }])
}

module.exports.resolveTargetConfig = resolveTargetConfig
