const rm = require('rimraf')
const merge = require('webpack-merge')
const { chalk, stopSpinner } = require('@vue/cli-shared-utils')
const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { transformMpxEntry } = require('@mpxjs/vue-cli-plugin-mpx')
const applyMpPluginWebpackConfig = require('../pluginMode')
const applyMpWebpackConfig = require('../config')
const resolveMpBaseWebpackConfig = require('../base')

/**
 * 取数组交集
 * @param {array} a
 * @param {array} b
 */
function intersection (a, b) {
  return a.filter((v) => b.includes(v))
}

/**
 * 获取@mpxjs/webpack-plugin选项
 * @param {*} options 选项
 */
function getMpxPluginOptions (options) {
  return options.pluginOptions ? options.pluginOptions.mpx || {} : {}
}

/**
 * 获取最终的targets
 * @param {*} args
 * @param {*} options
 * @returns
 */
function getTargets (args, options) {
  const mpxOptions = getMpxPluginOptions(options)
  args.targets = args.targets || mpxOptions.srcMode || supportedModes[0]
  const inputTargets = args.targets.split(',')
  return intersection(supportedModes, inputTargets)
}

/**
 * 清除文件
 * @param {string} distPath
 */
function clearDist (distPath) {
  try {
    rm.sync(distPath)
  } catch (e) {
    console.error(e)
    console.log(
      '\n\n删除dist文件夹遇到了一些问题，如果遇到问题请手工删除dist重来\n\n'
    )
  }
}

function resolveWebpackCompileCallback (isWatchMode) {
  return function (err, stats) {
    stopSpinner()
    if (err) return console.error(err)
    const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats]
    statsArr.forEach((item) => {
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

function addMpPluginWebpackConfig (api, options, webpackConfigs) {
  const mpxPluginWebpackConfig = merge({}, webpackConfigs[0])
  applyMpPluginWebpackConfig(api, options, mpxPluginWebpackConfig)
  webpackConfigs.push(mpxPluginWebpackConfig)
}

function genWebpackConfigByTarget (api, options, target, process) {
  const baseWebpackConfig = resolveMpBaseWebpackConfig(api, options)
  process && process(baseWebpackConfig)
  // 根据不同 mode 修改小程序构建的 webpack 配置
  applyMpWebpackConfig(api, options, baseWebpackConfig, target)
  // vue.config.js 当中 configureWebpack 的优先级要比 chainWebpack 更高
  const webpackConfig = api.resolveWebpackConfig(baseWebpackConfig)
  transformMpxEntry(api, options, webpackConfig, false)
  return webpackConfig
}

function genWebpackConfigByTargets (api, options, targets, process) {
  return targets.map((target) => {
    return genWebpackConfigByTarget(api, options, target, process)
  })
}

module.exports.genWebpackConfigByTarget = genWebpackConfigByTarget
module.exports.genWebpackConfigByTargets = genWebpackConfigByTargets
module.exports.getTargets = getTargets
module.exports.clearDist = clearDist
module.exports.resolveWebpackCompileCallback = resolveWebpackCompileCallback
module.exports.intersection = intersection
module.exports.getMpxPluginOptions = getMpxPluginOptions
module.exports.addMpPluginWebpackConfig = addMpPluginWebpackConfig
