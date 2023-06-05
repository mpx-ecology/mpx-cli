const webpack = require('webpack')
const { modifyConfig, handleWebpackDone } = require('../../utils/webpack')
const { parseTarget } = require('../../utils')

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
    if (!args.targets) {
      return api.service.commands.build.fn({ ...args, targets: 'web' }, [
        rawArgs,
        '--targets=web'
      ])
    }
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
  const target = parseTarget(args.target, options)
  Object.assign(options, { outputDir: targetDir })

  // resolve raw webpack config
  const webpackConfig = resolveWebBuildWebpackConfig(api, options, args)

  if (args.clean) {
    await fs.emptyDir(targetDir)
  }

  return new Promise((resolve, reject) => {
    webpack([webpackConfig], (err, stats) => {
      handleWebpackDone(err, stats, target).then(resolve).catch(reject)
    })
  })
}
