const rm = require('rimraf')
const webpack = require('webpack')
const merge = require('webpack-merge')
const { chalk, stopSpinner } = require('@vue/cli-shared-utils')
const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { transformMpxEntry } = require('@mpxjs/vue-cli-plugin-mpx')
const applyMpPluginWebpackConfig = require('../pluginMode')
const resolveTargetConfig = require('../config/target')
const resolveMpBaseWebpackConfig = require('../config/base')

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

function resolveWebpackConfigByTarget (
  api,
  options,
  target,
  resolveCustomConfig
) {
  const baseWebpackConfig = resolveMpBaseWebpackConfig(api, options)
  resolveCustomConfig && resolveCustomConfig(baseWebpackConfig)
  // 根据不同 mode 修改小程序构建的 webpack 配置
  resolveTargetConfig(api, options, baseWebpackConfig, target)
  // vue.config.js 当中 configureWebpack 的优先级要比 chainWebpack 更高
  const webpackConfig = api.resolveWebpackConfig(baseWebpackConfig)
  transformMpxEntry(api, options, webpackConfig, false)
  return webpackConfig
}

function resolveWebpackConfigByTargets (api, options, targets, process) {
  const webpackConfigs = targets.map((target) => {
    return resolveWebpackConfigByTarget(api, options, target, process)
  })
  // 小程序插件构建配置
  if (api.hasPlugin('mpx-plugin-mode')) {
    addMpPluginWebpackConfig(api, options, webpackConfigs)
  }
  return webpackConfigs
}

function runWebpack (config, watch) {
  const webpackCallback = resolveWebpackCompileCallback(watch)
  if (!watch) {
    webpack(config, webpackCallback)
  } else {
    webpack(config).watch({}, webpackCallback)
  }
}

module.exports.runWebpack = runWebpack
module.exports.resolveWebpackConfigByTarget = resolveWebpackConfigByTarget
module.exports.resolveWebpackConfigByTargets = resolveWebpackConfigByTargets
module.exports.getTargets = getTargets
module.exports.clearDist = clearDist
module.exports.resolveWebpackCompileCallback = resolveWebpackCompileCallback
module.exports.intersection = intersection
module.exports.getMpxPluginOptions = getMpxPluginOptions
module.exports.addMpPluginWebpackConfig = addMpPluginWebpackConfig
