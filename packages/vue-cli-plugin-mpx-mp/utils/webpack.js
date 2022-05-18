const webpack = require('webpack')
const merge = require('webpack-merge')
const { chalk, stopSpinner } = require('@vue/cli-shared-utils')
const { transformMpxEntry } = require('@mpxjs/vue-cli-plugin-mpx')
const resolveBaseWebpackConfig = require('../config/base')
const { resolveTargetConfig, processTargetConfig } = require('../config/target')
const resolvePluginWebpackConfig = require('../config/plugin')

function resolveWebpackCompileCallback (isWatchMode, resolve, reject) {
  return function (err, stats) {
    stopSpinner()
    if (err) {
      reject(err)
      console.error(err)
      return
    }
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
      reject(err)
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    if (isWatchMode) {
      console.log(
        chalk.cyan(`  ${new Date()} build finished.\n  Still watching...\n`)
      )
    }
    resolve(stats)
  }
}

/**
 * 根据target生成webpack配置
 * @param {*} api
 * @param {*} options
 * @param {*} target target {mode: 'wx', env: 'development|production'}
 * @param {*} resolveCustomConfig 自定义配置
 * @returns
 */
function resolveWebpackConfigByTarget (
  api,
  options,
  target,
  resolveCustomConfig
) {
  let webpackConfig = api.resolveChainableWebpackConfig()
  // 修改基础配置
  resolveBaseWebpackConfig(api, options, webpackConfig, target)
  // 根据不同target修改webpack配置
  resolveTargetConfig(api, options, webpackConfig, target)
  // 自定义配置
  resolveCustomConfig && resolveCustomConfig(webpackConfig, target)
  // resolve其他的插件配置以及vue.config.js配置
  webpackConfig = api.resolveWebpackConfig(webpackConfig)
  // 转换entry
  transformMpxEntry(api, options, webpackConfig, false)
  // 根据不同target修改webpack配置(webpack5，chainWebpack未兼容，直接修改)
  processTargetConfig(api, options, webpackConfig, target)
  // 返回配置文件
  return webpackConfig
}

function addMpPluginWebpackConfig (api, options, webpackConfigs) {
  const mpxPluginWebpackConfig = merge({}, webpackConfigs[0])
  resolvePluginWebpackConfig(api, options, mpxPluginWebpackConfig)
  webpackConfigs.push(mpxPluginWebpackConfig)
}

function resolveWebpackConfigByTargets (
  api,
  options,
  targets,
  resolveCustomConfig
) {
  const webpackConfigs = targets.map((target) => {
    return resolveWebpackConfigByTarget(
      api,
      options,
      target,
      resolveCustomConfig
    )
  })
  // 小程序插件构建配置
  if (api.hasPlugin('mpx-plugin-mode')) {
    addMpPluginWebpackConfig(api, options, webpackConfigs)
  }
  return webpackConfigs
}

function runWebpack (config, watch) {
  return new Promise((resolve, reject) => {
    const webpackCallback = resolveWebpackCompileCallback(
      watch,
      resolve,
      reject
    )
    if (!watch) {
      webpack(config, webpackCallback)
    } else {
      webpack(config).watch({}, webpackCallback)
    }
  })
}

module.exports.runWebpack = runWebpack
module.exports.resolveWebpackConfigByTarget = resolveWebpackConfigByTarget
module.exports.resolveWebpackConfigByTargets = resolveWebpackConfigByTargets
module.exports.addMpPluginWebpackConfig = addMpPluginWebpackConfig
module.exports.resolveWebpackCompileCallback = resolveWebpackCompileCallback
