const applyBaseMpxConfig = require('./config/base')
const registerMpBuildCommand = require('@mpxjs/vue-cli-plugin-mpx/commands/mp/build')
const registerMpServeCommand = require('@mpxjs/vue-cli-plugin-mpx/commands/mp/serve')
const registerMpInspectCommand = require('@mpxjs/vue-cli-plugin-mpx/commands/mp/inspect')
const registerWebBuildCommand = require('@mpxjs/vue-cli-plugin-mpx/commands/web/build')
const registerWebServeCommand = require('@mpxjs/vue-cli-plugin-mpx/commands/web/serve')
const registerWebInspectCommand = require('@mpxjs/vue-cli-plugin-mpx/commands/web/inspect')
const { transformMpxEntry } = require('@mpxjs/vue-cli-plugin-mpx')
const { resolveMpBaseWebpackConfig } = require('@mpxjs/vue-cli-plugin-mpx/config/mp/base')
const { resolveMpTargetConfig } = require('@mpxjs/vue-cli-plugin-mpx/config/mp/target')
const { runWebpackInChildProcess } = require('./utils/webpack')
const { getTargets } = require('./utils')
const { resolveWebBaseWebpackConfig } = require('./config/web/base')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function (api, options) {
  api.chainWebpack(webpackConfig => {
    applyBaseMpxConfig(api, options, webpackConfig)
  })

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

module.exports.transformMpxEntry = require('./utils/transformMpxEntry')
module.exports.resolveMpxLoader = require('./utils/resolveMpxLoader')
module.exports.resolveMpxWebpackPluginConf = require('./utils/resolveMpxWebpackPluginConf')
module.exports.MODE = require('./constants/mode')
module.exports.defaultModes = {
  'serve:mp': 'development',
  'build:mp': 'production',
  'inspect:mp': 'development'
}
