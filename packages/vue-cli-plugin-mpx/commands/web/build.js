const { getReporter } = require('../../utils/reporter')
const { modifyConfig, extractErrorsFromStats, extractResultFromStats } = require('../../utils/webpack')
const webpack = require('webpack')

const defaults = {
  clean: true,
  target: 'app',
  module: true,
  formats: 'commonjs,umd,umd-min'
}

module.exports = (api, options) => {
  api.registerCommand('build:web', {}, async (args, rawArgs) => {
    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }
    const moduleBuildArgs = { ...args, moduleBuild: true, clean: false }
    await build(moduleBuildArgs, api, options)
  })
}

async function build (args, api, options) {
  const fs = require('fs-extra')
  const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')
  const targetDir = api.resolve(options.outputDir)
  const isLegacyBuild = args.needsDifferentialLoading && !args.moduleBuild

  // resolve raw webpack config
  const webpackConfig =
    require('@vue/cli-service/lib/commands/build/resolveAppConfig')(
      api,
      args,
      options
    )

  // check for common config errors
  validateWebpackConfig(webpackConfig, api, options, args.target)

  if (args.watch) {
    modifyConfig(webpackConfig, (config) => {
      config.watch = true
    })
  }

  if (args.report) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    modifyConfig(webpackConfig, (config) => {
      const bundleName =
        args.target !== 'app'
          ? config.output.filename.replace(/\.js$/, '-')
          : isLegacyBuild
            ? 'legacy-'
            : ''
      config.plugins.push(
        new BundleAnalyzerPlugin({
          logLevel: 'warn',
          openAnalyzer: false,
          analyzerMode: args.report ? 'static' : 'disabled',
          reportFilename: `${bundleName}report.html`,
          statsFilename: `${bundleName}report.json`,
          generateStatsFile: !!args.report
        })
      )
    })
  }

  if (args.clean) {
    await fs.emptyDir(targetDir)
  }

  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, res) => {
      const hasErrors = err || res.hasErrors()
      const status = hasErrors ? 'with some errors' : 'successfully'
      getReporter()._renderStates(
        res.stats.map((v) => {
          return {
            ...v,
            name: 'web-compiler',
            message: `Compiled ${status}`,
            color: hasErrors ? 'red' : 'green',
            progress: 100,
            hasErrors: hasErrors,
            result: hasErrors
              ? extractErrorsFromStats(res)
              : extractResultFromStats(res)
          }
        }),
        () => (hasErrors ? reject(err) : resolve(res))
      )
    })
  })
}

module.exports.defaultModes = {
  build: 'production'
}
