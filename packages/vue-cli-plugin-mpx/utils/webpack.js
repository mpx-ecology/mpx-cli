const webpack = require('webpack')
const { merge } = require('webpack-merge')
const { runServiceCommand, removeArgv } = require('./index')
const { resolvePluginWebpackConfig } = require('../config/mp/plugin')
const { resolveBaseRawWebpackConfig } = require('../config/mp/base')
const LogUpdate = require('./logUpdate')

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
  // 强制添加一个修改webpack配置的方法，因为webpack-chain不支持webpack5
  api.service.webpackRawConfigFns.splice(
    api.service.webpackRawConfigFns.length - 1,
    0,
    resolveBaseRawWebpackConfig(api)
  )
  const webpackConfigs = []
  targets.forEach((target) => {
    const chainWebpackConfig = api.resolveChainableWebpackConfig() // 所有的插件的chainWebpack， 和vue.config.js里的chainWebpack
    resolveCustomConfig && resolveCustomConfig(chainWebpackConfig, target)
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

function extractErrorsFromStats (stats, type = 'errors') {
  if (isMultiStats(stats)) {
    const errors = stats.stats.reduce(
      (errors, stats) => errors.concat(extractErrorsFromStats(stats, type)),
      []
    )
    // Dedupe to avoid showing the same error many times when multiple
    // compilers depend on the same module.
    return uniqueBy(errors, (error) => error.message)
  }

  const findErrorsRecursive = (compilation) => {
    const errors = compilation[type]
    if (errors.length === 0 && compilation.children) {
      for (const child of compilation.children) {
        errors.push(...findErrorsRecursive(child))
      }
    }
    return uniqueBy(errors, (error) => error.message)
  }

  return findErrorsRecursive(stats.compilation)
}

function uniqueBy (arr, fun) {
  const seen = {}
  return arr.filter((el) => {
    const e = fun(el)
    return !(e in seen) && (seen[e] = 1)
  })
}

function isMultiStats (stats) {
  return stats.stats
}

function runWebpack (config, { watch }) {
  return new Promise((resolve, reject) => {
    function webpackCallback (err, stats) {
      if (err) {
        return reject(err)
      }
      if (stats.hasErrors()) {
        return reject(new Error('Build failed with errors.' + extractErrorsFromStats(stats)))
      }
      resolve()
    }
    if (!watch) {
      webpack(config, webpackCallback)
    } else {
      webpack(config).watch({}, webpackCallback)
    }
  })
}

/**
 * @typedef { import('../utils/index').Target } Target
 * @param {string} rawArgv
 * @param { { targets: Target, watch: boolean } } param1
 * @returns
 */
function runWebpackInChildProcess (command, rawArgv, { targets, watch }) {
  const logUpdate = new LogUpdate()
  return new Promise((resolve, reject) => {
    const chunks = []
    let doneNum = 0
    targets.forEach((target, index) => {
      const ls = runServiceCommand(
        command,
        [
          ...removeArgv(rawArgv, '--targets'),
          `--targets=${target.mode}:${target.env}`
        ],
        {
          env: {
            ...process.env,
            FORCE_COLOR: true,
            MPX_CURRENT_TARGET_MODE: target.mode,
            MPX_CURRENT_TARGET_ENV: target.env
          },
          stderr: 'inherit'
        }
      )
      let output = ''
      ls.stdout.addListener('data', (d) => {
        output += `${d}`
      })
      ls.on('message', (data) => {
        if (data.status === 'done') {
          doneNum++
          if (doneNum === targets.length) {
            doneNum = 0
            logUpdate.extraLines = ''
            resolve()
          }
        } else {
          chunks[index] = data.message
          logUpdate.render('\n' + chunks.join('\n\n'))
        }
      })
      ls.on('close', () => {
        console.log(output)
      })
    })
  })
}

module.exports.runWebpackInChildProcess = runWebpackInChildProcess
module.exports.runWebpack = runWebpack
module.exports.resolveWebpackConfigByTargets = resolveWebpackConfigByTargets
