const { merge } = require('webpack-merge')
const { runServiceCommand } = require('./index')
const { resolvePluginWebpackConfig } = require('../config/mp/plugin')
const { resolveBaseRawWebpackConfig } = require('../config/mp/base')
const { LogUpdate } = require('./reporter')

/**
 * 获取基础配置通过构建目标，该方法会运行插件方法并增加默认配置
 * @param {import('@vue/cli-service').PluginAPI} api
 * @param {import('@vue/cli-service').ProjectOptions} options
 * @returns
 */
function resolveWebpackConfigByTarget (
  api,
  options,
  target,
  resolveCustomConfig
) {
  // 强制添加一个修改webpack配置的方法，因为webpack-chain不支持webpack5
  api.service.webpackRawConfigFns.splice(
    api.service.webpackRawConfigFns.length - 1,
    0,
    resolveBaseRawWebpackConfig(api)
  )
  const webpackConfigs = []
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
  return webpackConfigs
}

/**
 * 通过子进程构建目标
 * @typedef { import('./index').Target } Target
 * @param {string} rawArgv
 * @param { { targets: Target, watch: boolean } } param1
 * @returns
 */
const chunks = []
let doneNum = 0
let num = 0
const logUpdate = new LogUpdate()
function buildTargetInChildProcess (command, rawArgv, { target, watch }) {
  const index = num++
  return new Promise((resolve, reject) => {
    const ls = runServiceCommand(
      command,
      [...rawArgv, `--target=${target.mode}:${target.env}`],
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
    // 执行错误
    ls.catch(reject)
    // 进度条数据
    ls.on('message', (data) => {
      if (data.status === 'done') {
        doneNum++
        if (doneNum === num) {
          doneNum = 0
          logUpdate.extraLines = ''
          resolve()
        }
      } else {
        chunks[index] = data.message
        logUpdate.render('\n' + chunks.join('\n\n'))
      }
    })
    // render过程中，其它的数据在结束后展示
    let output = ''
    ls.stdout.addListener('data', (d) => {
      output += `${d}`
    })
    ls.on('close', () => {
      console.log(output)
    })
  })
}

/**
 * 从stats里提取结果信息
 * @param {*} stats
 * @returns
 */
function extractResultFromStats (stats) {
  const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats]
  return statsArr.map((item) => {
    return item
      .toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false
      })
      .split('\n')
      .map((v) => `  ${v}`)
      .join('\n')
  })
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

/**
 * 从stats里提取错误信息
 * @param {*} stats
 * @param {*} type
 * @returns
 */
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

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach((c) => fn(c))
  } else {
    fn(config)
  }
}

module.exports.modifyConfig = modifyConfig
module.exports.extractResultFromStats = extractResultFromStats
module.exports.extractErrorsFromStats = extractErrorsFromStats
module.exports.buildTargetInChildProcess = buildTargetInChildProcess
module.exports.resolveWebpackConfigByTarget = resolveWebpackConfigByTarget
