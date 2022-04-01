const rm = require('rimraf')
const { chalk, stopSpinner } = require('@vue/cli-shared-utils')

/**
 * 取数组交集
 * @param {array} a
 * @param {array} b
 */
module.exports.intersection = (a, b) => {
  return a.filter(v => b.includes(v))
}

/**
 * 获取@mpxjs/webpack-plugin选项
 * @param {*} options 选项
 */
module.exports.getMpxPluginOptions = function getPluginOptions (options) {
  return options.pluginOptions ? options.pluginOptions.mpx || {} : {}
}

/**
 * 清除文件
 * @param {string} distPath
 */
module.exports.clearDist = function clearDist (distPath) {
  try {
    rm.sync(distPath)
  } catch (e) {
    console.error(e)
    console.log(
      '\n\n删除dist文件夹遇到了一些问题，如果遇到问题请手工删除dist重来\n\n'
    )
  }
}

module.exports.resolveWebpackCompileCallback =
  function resolveWebpackCompileCallback (isWatchMode) {
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
