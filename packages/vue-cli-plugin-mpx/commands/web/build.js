const { runWebpack } = require('../../../vue-cli-plugin-mpx-mp/utils/webpack')

const defaults = {
  clean: true,
  target: 'app',
  module: true,
  formats: 'commonjs,umd,umd-min'
}

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach((c) => fn(c))
  } else {
    fn(config)
  }
}

module.exports = (api, options) => {
  api.registerCommand(
    'build:web',
    {
      description: 'build for production',
      usage: 'vue-cli-service build [options] [entry|pattern]',
      options: {
        '--mode': 'specify env mode (default: production)',
        '--dest': `specify output directory (default: ${options.outputDir})`,
        '--no-module':
          'build app without generating <script type="module"> chunks for modern browsers',
        '--target': `app | lib | wc | wc-async (default: ${defaults.target})`,
        '--inline-vue':
          'include the Vue module in the final bundle of library or web component target',
        '--formats': `list of output formats for library builds (default: ${defaults.formats})`,
        '--name':
          'name for lib or web-component mode (default: "name" in package.json or entry filename)',
        '--filename':
          "file name for output, only usable for 'lib' target (default: value of --name)",
        '--no-clean':
          'do not remove the dist directory contents before building the project',
        '--report': 'generate report.html to help analyze bundle content',
        '--report-json': 'generate report.json to help analyze bundle content',
        '--skip-plugins':
          'comma-separated list of plugin names to skip for this run',
        '--watch': 'watch for changes',
        '--stdin': 'close when stdin ends'
      }
    },
    async (args, rawArgs) => {
      for (const key in defaults) {
        if (args[key] == null) {
          args[key] = defaults[key]
        }
      }
      const moduleBuildArgs = { ...args, moduleBuild: true, clean: false }
      await build(moduleBuildArgs, api, options)
    }
  )
}

async function build (args, api, options) {
  const fs = require('fs-extra')
  const validateWebpackConfig = require('@vue/cli-service/lib/util/validateWebpackConfig')

  if (args.dest) {
    // Override outputDir before resolving webpack config as config relies on it (#2327)
    options.outputDir = args.dest
  }

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

  if (args.stdin) {
    process.stdin.on('end', () => {
      process.exit(0)
    })
    process.stdin.resume()
  }

  if (args.report || args['report-json']) {
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
          generateStatsFile: !!args['report-json']
        })
      )
    })
  }

  if (args.clean) {
    await fs.emptyDir(targetDir)
  }

  return runWebpack(webpackConfig, {
    watch: args.watch
  })
}

module.exports.defaultModes = {
  build: 'production'
}
