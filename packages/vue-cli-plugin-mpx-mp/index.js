const registerMpBuildCommand = require('./commands/mp/build')
const registerMpServeCommand = require('./commands/mp/serve')
const registerMpInspectCommand = require('./commands/mp/inspect')
const registerWebBuildCommand = require('./commands/web/build')
const registerWebServeCommand = require('./commands/web/serve')
const registerWebInspectCommand = require('./commands/web/inspect')
const { transformMpxEntry } = require('@mpxjs/vue-cli-plugin-mpx')
const { resolveMpBaseWebpackConfig } = require('./config/mp/base')
const { resolveMpTargetConfig } = require('./config/mp/target')
const { runWebpackInChildProcess } = require('./utils/webpack')
const { getTargets } = require('./utils')
const { resolveWebBaseWebpackConfig } = require('./config/web/base')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function (api, options) {
  const target = {
    mode: process.env.MPX_CURRENT_TARGET_MODE,
    env: process.env.MPX_CURRENT_TARGET_ENV
  }
  if (target.mode === 'web') {
    if (options.outputDir === 'dist') {
      options.outputDir = 'dist/web'
    }
  }
  // web command
  registerWebBuildCommand(api, options)
  registerWebServeCommand(api, options)
  registerWebInspectCommand(api, options)

  // mp command
  registerMpBuildCommand(api, options)
  registerMpServeCommand(api, options)
  registerMpInspectCommand(api, options)

  api.registerCommand('build', (args, rawArgv) => {
    const targets = getTargets(args, options)
    return runWebpackInChildProcess('build:mp', rawArgv, {
      targets,
      watch: false
    })
  })

  api.chainWebpack((config) => {
    if (target.mode === 'web') {
      resolveWebBaseWebpackConfig(api, options, config)
    } else {
      // 修改基础配置
      resolveMpBaseWebpackConfig(api, options, config, target)
      // 根据不同target修改webpack配置
      resolveMpTargetConfig(api, options, config, target)
      // 转换entry
      transformMpxEntry(api, options, config)
    }
  })
}

module.exports.defaultModes = {
  'serve:mp': 'development',
  'build:mp': 'production',
  'inspect:mp': 'development'
}

module.exports.platform = 'mp'
