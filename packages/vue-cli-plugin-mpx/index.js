const applyBaseMpxConfig = require('./config/base')
const registerMpBuildCommand = require('./commands/mp/build')
const registerMpServeCommand = require('./commands/mp/serve')
const registerMpInspectCommand = require('./commands/mp/inspect')
const registerWebBuildCommand = require('./commands/web/build')
const registerWebServeCommand = require('./commands/web/serve')
const registerWebInspectCommand = require('./commands/web/inspect')
const { transformMpxEntry } = require('./utils/transformMpxEntry')
const { resolveMpBaseWebpackConfig } = require('./config/mp/base')
const { resolveMpTargetConfig } = require('./config/mp/target')
const { runWebpackInChildProcess } = require('./utils/webpack')
const { getTargets } = require('./utils')
const { resolveWebBaseWebpackConfig } = require('./config/web/base')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function (api, options) {
  // 当前构建的目标
  const currentTarget = {
    mode: process.env.MPX_CURRENT_TARGET_MODE,
    env: process.env.MPX_CURRENT_TARGET_ENV
  }

  // 修改web构建输出位置
  if (currentTarget.mode === 'web') {
    if (options.outputDir === 'dist') {
      options.outputDir = 'dist/web'
    }
  }

  // register command
  registerWebBuildCommand(api, options)
  registerWebServeCommand(api, options)
  registerWebInspectCommand(api, options)
  registerMpBuildCommand(api, options)
  registerMpServeCommand(api, options)
  registerMpInspectCommand(api, options)

  // 替换build和serve命令
  api.registerCommand('build', function build (args, rawArgv) {
    const targets = getTargets(args, options)
    const webTargets = targets.filter(v => v.mode === 'web')
    const mpTargets = targets.filter(v => v.mode !== 'web')
    const promises = []
    if (webTargets.length) {
      promises.push(runWebpackInChildProcess('build:web', rawArgv, {
        targets: webTargets,
        watch: false
      }))
    }
    if (mpTargets.length) {
      promises.push(runWebpackInChildProcess('build:mp', rawArgv, {
        targets: mpTargets,
        watch: false
      }))
    }
    return Promise.all(promises)
  })

  api.registerCommand('serve', (args, rawArgv) => {
    const targets = getTargets(args, options)
    const webTargets = targets.filter(v => v.mode === 'web')
    const mpTargets = targets.filter(v => v.mode !== 'web')
    const promises = []
    if (webTargets.length) {
      promises.push(runWebpackInChildProcess('serve:web', rawArgv, {
        targets: webTargets,
        watch: false
      }))
    }
    if (mpTargets.length) {
      promises.push(runWebpackInChildProcess('serve:mp', rawArgv, {
        targets: mpTargets,
        watch: false
      }))
    }
    return Promise.all(promises)
  })

  api.chainWebpack((config) => {
    applyBaseMpxConfig(api, options, config)
    if (currentTarget.mode === 'web') {
      resolveWebBaseWebpackConfig(api, options, config)
    } else {
      // 修改基础配置
      resolveMpBaseWebpackConfig(api, options, config, currentTarget)
      // 根据不同target修改webpack配置
      resolveMpTargetConfig(api, options, config, currentTarget)
      // 转换entry
      transformMpxEntry(api, options, config)
    }
  })
}

module.exports.MODE = require('./constants/mode')
module.exports.defaultModes = {
  'serve:mp': 'development',
  'build:mp': 'production',
  'inspect:mp': 'development'
}
