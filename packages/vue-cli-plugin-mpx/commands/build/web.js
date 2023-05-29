const { getReporter } = require('../../utils/reporter')
const {
  modifyConfig,
  extractErrorsFromStats,
  extractResultFromStats
} = require('../../utils/webpack')
const webpack = require('webpack')

const defaults = {
  clean: true,
  target: 'app',
  module: true,
  formats: 'commonjs,umd,umd-min'
}

const resolveWebBuildWebpackConfig = (api, options, args) => {
  const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')
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
  return webpackConfig
}

module.exports.resolveWebBuildWebpackConfig = resolveWebBuildWebpackConfig

module.exports.registerWebBuildCommand = (api, options) => {
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
  const targetDir = api.resolve('dist/web')
  Object.assign(options, { outputDir: targetDir })

  // resolve raw webpack config
  const webpackConfig = resolveWebBuildWebpackConfig(api, options, args)

  if (args.clean) {
    await fs.emptyDir(targetDir)
  }

  return new Promise((resolve, reject) => {
    webpack([webpackConfig], (err, stats) => {
      if (err) return reject(err)
      const hasErrors = stats.hasErrors()
      const hasWarnings = stats.hasWarnings()
      const status = hasErrors
        ? 'with some errors'
        : hasWarnings
          ? 'with some warnings'
          : 'successfully'
      const result = []
      if (hasErrors) result.push(extractErrorsFromStats(stats))
      if (hasWarnings) result.push(extractErrorsFromStats(stats, 'warnings'))
      if (!hasErrors) result.push(extractResultFromStats(stats))
      getReporter()._renderStates(
        stats.stats.map((v) => {
          return {
            ...v,
            name: 'web-compiler',
            message: `Compiled ${status}`,
            color: hasErrors ? 'red' : 'green',
            progress: 100,
            hasErrors: hasErrors,
            result: result.join('\n')
          }
        }),
        () => (hasErrors ? reject(err) : resolve(stats))
      )
    })
  })
}
