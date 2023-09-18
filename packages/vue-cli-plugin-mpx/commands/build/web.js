const webpack = require('webpack')
const { handleWebpackDone, modifyMpxPluginConfig } = require('../../utils/webpack')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')

const resolveWebBuildWebpackConfig = (api, options, args) => {
  const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')
  api.chainWebpack((config) => {
    if (args.watch) {
      config.watch(true)
    }
    if (args.report) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugin('bundler-analyzer-plugin', BundleAnalyzerPlugin, [
        {
          logLevel: 'warn',
          openAnalyzer: false,
          analyzerMode: args.report ? 'static' : 'disabled',
          reportFilename: 'report.html',
          statsFilename: 'report.json',
          generateStatsFile: !!args.report
        }
      ])
    }
    if (args.env) {
      modifyMpxPluginConfig(api, config, {
        env: args.env
      })
    }
  })
  // resolve raw webpack config
  const webpackConfig =
    require('@vue/cli-service/lib/commands/build/resolveAppConfig')(
      api,
      args,
      options
    )
  // check for common config errors
  validateWebpackConfig(webpackConfig, api, options)
  return webpackConfig
}

module.exports.buildWeb = async (api, options, args) => {
  const fs = require('fs-extra')
  const outputDir =
    options.outputDir !== 'dist' ? options.outputDir : 'dist/web'
  const target = getCurrentTarget()
  Object.assign(options, { outputDir })

  // resolve raw webpack config
  const webpackConfig = resolveWebBuildWebpackConfig(api, options, args)

  if (args.clean) {
    await fs.emptyDir(outputDir)
  }

  return new Promise((resolve, reject) => {
    webpack([webpackConfig], (err, stats) => {
      handleWebpackDone(err, stats, target, api).then(resolve).catch(reject)
    })
  })
}
module.exports.resolveWebBuildWebpackConfig = resolveWebBuildWebpackConfig
