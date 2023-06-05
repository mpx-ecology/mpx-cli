const { merge } = require('webpack-merge')
const { runServiceCommand } = require('./index')
const { resolvePluginWebpackConfig } = require('../config/mp/plugin')
const { resolveBaseRawWebpackConfig } = require('../config/mp/base')
const { LogUpdate, getReporter } = require('./reporter')
const { extractResultFromStats, extractErrorsFromStats } = require('./output')

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
function buildTargetInChildProcess (command, target, rawArgv) {
  const index = num++
  return new Promise((resolve, reject) => {
    const ls = runServiceCommand(
      command,
      [...rawArgv, `--target=${target.mode}${target.env ? `:${target.env}` : ''}`],
      {
        env: {
          ...process.env,
          FORCE_COLOR: true,
          MPX_CURRENT_TARGET_MODE: target.mode,
          MPX_CURRENT_TARGET_ENV: target.env,
          NODE_ENV: undefined
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
        logUpdate.render(chunks.join('\n\n'))
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

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach((c) => fn(c))
  } else {
    fn(config)
  }
}

module.exports.handleWebpackDone = function (err, stats, target) {
  return new Promise((resolve, reject) => {
    if (err) return reject(err)
    const hasErrors = stats.hasErrors()
    const hasWarnings = stats.hasWarnings()
    const status = hasErrors
      ? 'with some errors'
      : hasWarnings
        ? 'with some warnings'
        : 'successfully'
    const result = []
    if (hasErrors) result.push(extractResultFromStats(stats))
    if (hasWarnings) result.push(extractErrorsFromStats(stats, 'warnings'))
    if (!hasErrors) result.push(extractResultFromStats(stats))
    getReporter()._renderStates(
      stats.stats.map((v) => {
        return {
          ...v,
          name: `${target.mode}-compiler`,
          message: `Compiled ${status}`,
          color: hasErrors ? 'red' : 'green',
          progress: 100,
          hasErrors: hasErrors,
          result: result.join('\n')
        }
      }),
      () => (hasErrors ? reject(new Error('Build error')) : resolve(stats))
    )
  })
}
module.exports.modifyConfig = modifyConfig
module.exports.buildTargetInChildProcess = buildTargetInChildProcess
module.exports.resolveWebpackConfigByTarget = resolveWebpackConfigByTarget
