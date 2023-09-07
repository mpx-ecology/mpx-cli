const webpack = require('webpack')
const { modifyConfig, handleWebpackDone } = require('../../utils/webpack')
const { getCurrentTarget } = require('@mpxjs/mpx-cli-service/shared')

const resolveWebBuildWebpackConfig = (api, options, args) => {
  const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')
  // resolve raw webpack config
  const webpackConfig =
    require('@vue/cli-service/lib/commands/build/resolveAppConfig')(
      api,
      args,
      options
    )
  // check for common config errors
  validateWebpackConfig(webpackConfig, api, options)
  if (args.watch) {
    modifyConfig(webpackConfig, (config) => {
      config.watch = true
    })
  }
  if (args.report) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    modifyConfig(webpackConfig, (config) => {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          logLevel: 'warn',
          openAnalyzer: false,
          analyzerMode: args.report ? 'static' : 'disabled',
          reportFilename: 'report.html',
          statsFilename: 'report.json',
          generateStatsFile: !!args.report
        })
      )
    })
  }
  return webpackConfig
}

module.exports.resolveWebBuildWebpackConfig = resolveWebBuildWebpackConfig

module.exports.buildWeb = (api, options, args) => {
  const moduleBuildArgs = { ...args, moduleBuild: true, clean: false }
  return build(moduleBuildArgs, api, options)
}

async function build (args, api, options) {
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
