const webpack = require('webpack')
const { merge } = require('webpack-merge')
const { chalk, stopSpinner } = require('@vue/cli-shared-utils')
const { runServiceCommand, removeArgv } = require('./index')
const { resolvePluginWebpackConfig } = require('../config/plugin')
const { resolveBaseRawWebpackConfig } = require('../config/base')

/**
 * 基础配置
 * @param {import('@vue/cli-service').PluginAPI} api
 * @param {import('@vue/cli-service').ProjectOptions} options
 * @returns
 */
function resolveWebpackConfigByTargets (
  api,
  options,
  targets,
  resolveCustomConfig
) {
  const webpackConfigs = []
  targets.forEach((target) => {
    process.env.MPX_CURRENT_TARGET_MODE = target.mode
    process.env.MPX_CURRENT_TARGET_ENV = target.env
    const chainWebpackConfig = api.resolveChainableWebpackConfig() // 所有的插件的chainWebpack， 和vue.config.js里的chainWebpack
    resolveCustomConfig && resolveCustomConfig(chainWebpackConfig, target)
    api.service.webpackRawConfigFns.splice(
      api.service.webpackRawConfigFns.length - 1,
      0,
      resolveBaseRawWebpackConfig(api)
    )
    const webpackConfig = api.resolveWebpackConfig(chainWebpackConfig)
    webpackConfigs.push(webpackConfig)
    // 小程序插件构建配置
    if (target.mode === 'wx' && api.hasPlugin('mpx-plugin-mode')) {
      webpackConfigs.push(
        resolvePluginWebpackConfig(api, options, merge({}, webpackConfig))
      )
    }
  })
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
module.exports.resolveWebpackConfigByTargets = resolveWebpackConfigByTargets
