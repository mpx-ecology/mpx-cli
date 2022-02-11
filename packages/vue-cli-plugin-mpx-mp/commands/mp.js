const rm = require('rimraf')
const merge = require('webpack-merge')
const webpack = require('webpack')
const {
  transformMpxEntry,
  supportedModes
} = require('@mpxjs/vue-cli-plugin-mpx')
const applyMpWebpackConfig = require('../config')
const applyMpPluginWebpackConfig = require('../pluginMode')
const { chalk, logWithSpinner, stopSpinner } = require('@vue/cli-shared-utils')

module.exports = function registerMpCommand(api, options, command) {
  api.registerCommand(
    command,
    {
      description: 'mp development',
      usage: 'npm run serve',
      options: {
        '--wx': 'compile for wx platform',
        '--ali': 'compile for ali platform',
        '--watch': 'compile in watch mode',
        '--production': 'compile in webpack production mode',
        '--report': 'generate report.html to help analyze bundle content'
      }
    },
    function (args) {
      const srcMode =
        options.pluginOptions &&
        options.pluginOptions.mpx &&
        options.pluginOptions.mpx.srcMode

      let modes = supportedModes.filter((mode) => !!args[mode])
      if (modes.length === 0) {
        modes = [srcMode]
      }

      logWithSpinner('⚓', 'Building...')

      let webpackConfigs = []
      // 小程序业务代码构建配置
      modes.map((mode) => {
        clearDist(api.resolve(`dist/${mode}/*`))

        let baseWebpackConfig = api.resolveChainableWebpackConfig()

        // 根据不同 mode 修改小程序构建的 webpack 配置
        applyMpWebpackConfig(
          api,
          options,
          baseWebpackConfig,
          args,
          srcMode,
          mode
        )
        // vue.config.js 当中 configureWebpack 的优先级要比 chainWebpack 更高
        baseWebpackConfig = api.resolveWebpackConfig(baseWebpackConfig)

        const isWeb = false
        transformMpxEntry(api, options, baseWebpackConfig, isWeb)

        webpackConfigs.push(baseWebpackConfig)
      })

      // 小程序插件构建配置
      if (api.hasPlugin('mpx-plugin-mode')) {
        const mpxPluginWebpackConfig = merge({}, webpackConfigs[0])
        applyMpPluginWebpackConfig(api, options, mpxPluginWebpackConfig)
        webpackConfigs.push(mpxPluginWebpackConfig)
      }

      const isWatching = !!args.watch
      const webpackCallback = resolveWebpackCompileCallback(isWatching)
      if (!isWatching) {
        webpack(webpackConfigs, webpackCallback)
      } else {
        webpack(webpackConfigs).watch({}, webpackCallback)
      }
    }
  )
}

function clearDist(distPath) {
  try {
    rm.sync(distPath)
  } catch (e) {
    console.error(e)
    console.log(
      '\n\n删除dist文件夹遇到了一些问题，如果遇到问题请手工删除dist重来\n\n'
    )
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
