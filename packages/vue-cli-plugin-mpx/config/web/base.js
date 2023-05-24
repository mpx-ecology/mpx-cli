const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const WebpackBar = require('webpackbar')
const minimist = require('minimist')
const { transformMpxEntry } = require('../../utils/transformMpxEntry')
const {
  resolveMpxWebpackPluginConf
} = require('../../utils/resolveMpxWebpackPluginConf')
const { resolveMpxLoader } = require('../../utils/resolveMpxLoader')
const { FancyReporter } = require('../../utils/reporter')

module.exports.resolveWebBaseWebpackConfig = function (api, options = {}, webpackConfig) {
  webpackConfig.name('web-compiler')
  transformMpxEntry(api, options, webpackConfig, true)
  const mpxLoader = resolveMpxLoader(api, options)
  webpackConfig.plugins.delete('friendly-errors')
  webpackConfig.module
    .rule('mpx')
    .test(/\.mpx$/)
    .use('vue-loader')
    .loader(require.resolve('@vue/vue-loader-v15'))
    .end()
    .use('mpx-loader')
    .loader(require.resolve(mpxLoader.loader))
    .options(mpxLoader.options)

  // 直接更新 vue-cli-service 内部的 vue-loader options 配置
  webpackConfig.module
    .rule('vue')
    .use('vue-loader')
    .tap((options) =>
      Object.assign(options, {
        transformAssetUrls: {
          'mpx-image': 'src',
          'mpx-audio': 'src',
          'mpx-video': 'src'
        }
      })
    )

  // 对于 svg 交给 mpx-url-loader 处理，去掉 vue-cli 配置的 svg 规则
  webpackConfig.module.rules.delete('svg')

  const parsedArgs = minimist(process.argv.slice(2))

  webpackConfig.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [
    {
      mode: 'web',
      srcMode: 'wx',
      env: parsedArgs.env,
      forceDisableBuiltInLoader: true,
      ...resolveMpxWebpackPluginConf(api, options)
    }
  ])

  // fancy reporter
  webpackConfig.plugin('webpackbar').use(WebpackBar, [
    {
      color: 'orange',
      name: process.env.MPX_CURRENT_TARGET_MODE + (process.env.VUE_CLI_MODERN_BUILD === 'true' ? '-modern' : '') + '-compiler',
      basic: false,
      reporter: new FancyReporter()
    }
  ])
}
