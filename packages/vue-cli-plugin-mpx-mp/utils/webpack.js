const webpack = require('webpack')
const merge = require('webpack-merge')
const { chalk, stopSpinner } = require('@vue/cli-shared-utils')
const { runServiceCommand, removeArgv } = require('./index')
const { processTargetConfig } = require('../config/target')
const resolvePluginWebpackConfig = require('../config/plugin')

/**
 * 根据target生成webpack配置
 * @param {*} api
 * @param {*} options
 * @param {*} target target {mode: 'wx', env: 'development|production'}
 */
function resolveWebpackConfigByTarget (
  config,
  api,
  options,
  target
) {

}

function addMpPluginWebpackConfig (api, options, webpackConfigs) {
  const mpxPluginWebpackConfig = merge({}, webpackConfigs[0])
  resolvePluginWebpackConfig(api, options, mpxPluginWebpackConfig)
  webpackConfigs.push(mpxPluginWebpackConfig)
}

module.exports.currentTarget = {}

function resolveWebpackConfigByTargets (
  api,
  options,
  targets,
  resolveCustomConfig
) {
  // 根据不同target修改webpack配置(webpack5，chainWebpack未兼容，直接修改)
  const webpackConfigs = targets.map((target) => {
    Object.assign(module.exports.currentTarget, target)
    const chainWebpackConfig = api.resolveChainableWebpackConfig()
    resolveCustomConfig && resolveCustomConfig(chainWebpackConfig, target)
    const webpackConfig = api.resolveWebpackConfig(chainWebpackConfig)
    processTargetConfig(api, options, webpackConfig, target)
    return webpackConfig
  })
  // 小程序插件构建配置
  if (api.hasPlugin('mpx-plugin-mode')) {
    addMpPluginWebpackConfig(api, options, webpackConfigs)
  }
  return webpackConfigs
}

function genBuildCompletedLog (watch) {
  return chalk.cyan(
    watch
      ? `  ${new Date()} build finished.\n  Still watching...\n`
      : '  Build complete.\n'
  )
}

function runWebpack (config, { watch }) {
  return new Promise((resolve, reject) => {
    function webpackCallback (err, stats) {
      stopSpinner(false)
      if (err) return reject(err)
      if (!watch && stats.hasErrors()) {
        const err = new Error(chalk.red('Build failed with errors.\n'))
        process.send && process.send(err)
        return reject(err)
      }
      if (!process.send) {
        console.log(genBuildCompletedLog(watch))
      } else {
        process.send(null)
      }
      return resolve()
    }
    if (!watch) {
      webpack(config, webpackCallback)
    } else {
      webpack(config).watch({}, webpackCallback)
    }
  })
}

function runWebpackInChildProcess (command, rawArgv, { targets, watch }) {
  let complete = 0
  let chunks = []
  let hasErrors = false
  function reset () {
    complete = 0
    chunks = []
    hasErrors = false
  }
  function logChunks () {
    console.log(chunks.map((v) => v.join('')).join(''))
  }
  return new Promise((resolve, reject) => {
    targets.forEach((target, index) => {
      let errorHandled = false
      const ls = runServiceCommand(
        command,
        [
          ...removeArgv(rawArgv, '--targets'),
          `--targets=${target.mode}:${target.env}`
        ],
        {
          env: {
            ...process.env,
            FORCE_COLOR: true
          }
        }
      )
      ls.stdout.on('data', (data) => {
        chunks[index] = chunks[index] || []
        chunks[index].push(data)
      })
      ls.on('message', (err) => {
        if (err) hasErrors = true
        errorHandled = true
        complete++
        if (complete === targets.length) {
          stopSpinner(false)
          if (hasErrors) {
            logChunks()
            reject(new Error('Build failed with errors.\n'))
          } else {
            chunks.push([genBuildCompletedLog(watch)])
            logChunks()
            resolve()
          }
          reset()
        }
      })
      ls.catch((err) => {
        if (!errorHandled) {
          stopSpinner(false)
          console.error(err.message)
          process.exit(1)
        }
      })
    })
  })
}

module.exports.runWebpackInChildProcess = runWebpackInChildProcess
module.exports.runWebpack = runWebpack
module.exports.resolveWebpackConfigByTarget = resolveWebpackConfigByTarget
module.exports.resolveWebpackConfigByTargets = resolveWebpackConfigByTargets
module.exports.addMpPluginWebpackConfig = addMpPluginWebpackConfig
