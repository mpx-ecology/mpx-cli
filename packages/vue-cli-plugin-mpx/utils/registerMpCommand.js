const rm = require('rimraf')
const webpack = require('webpack')
const transformMpxEntry = require('./transformMpxEntry')
const applyMpWebpackConfig = require('../config/mp')
const supportedModes = require('../config/supportedModes')
const { chalk, logWithSpinner, stopSpinner } = require('@vue/cli-shared-utils')

module.exports = function registerMpCommand(api, options, command) {
  api.registerCommand(command, {
    description: 'mp development',
    usage: 'npm run serve',
    options: {
      '--wx': 'compile for wx platform',
      '--ali': 'compile for ali platform',
      '--watch': 'compile in watch mode',
      '--production': 'compile in webpack production mode'
    }
  }, function(args) {
    const srcMode =
      options.pluginOptions &&
      options.pluginOptions.mpx &&
      options.pluginOptions.mpx.srcMode
    const isCompileProd = !!args.production
    const isWatching = !!args.watch
    const webpackCallback = resolveWebpackCompileCallback(isWatching)

    let modes = supportedModes.filter(mode => !!args[mode])
    if (modes.length === 0) {
      modes = [srcMode]
    }

    logWithSpinner('⚓', 'Building...')

    modes.map(mode => {
      clearDist(api.resolve(`dist/${mode}/*`))

      let baseWebpackConfig = api.resolveChainableWebpackConfig()
      baseWebpackConfig.plugins.clear()

      if (api.hasPlugin('mpx-dll')) {
        const { addDllConf } = require('vue-cli-plugin-mpx-dll')
        addDllConf(api, options, baseWebpackConfig, mode)
      }

      applyMpWebpackConfig(
        api,
        options,
        baseWebpackConfig,
        mode,
        isWatching,
        isCompileProd
      )

      // TODO: 待确认
      baseWebpackConfig.optimization.clear()
      baseWebpackConfig.optimization.minimizers.clear()
      baseWebpackConfig = baseWebpackConfig.toConfig()
      transformMpxEntry(api, options, baseWebpackConfig, false)

      if (!isWatching) {
        webpack(baseWebpackConfig, webpackCallback)
      } else {
        webpack(baseWebpackConfig).watch({}, webpackCallback)
      }
    })
  })
}

function clearDist(distPath) {
  try {
    rm.sync(distPath)
  } catch (e) {
    console.error(e)
    console.log('\n\n删除dist文件夹遇到了一些问题，如果遇到问题请手工删除dist重来\n\n')
  }
}

function resolveWebpackCompileCallback(isWatchMode) {
  return function (err, stats) {
    stopSpinner()
    if (err) return console.error(err)

    if (Array.isArray(stats.stats)) {
      stats.stats.forEach((item) => {
        console.log(item.compilation.name + '打包结果：')
        process.stdout.write(
          item.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
            entrypoints: false
          }) + '\n\n'
        )
      })
    } else {
      process.stdout.write(
        stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
          entrypoints: false
        }) + '\n\n'
      )
    }

    if (!isWatchMode && stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    if (isWatchMode) {
      console.log(
        chalk.cyan(`  ${new Date()} build finished.\n  Still watching...\n`)
      )
    }
  }
}
