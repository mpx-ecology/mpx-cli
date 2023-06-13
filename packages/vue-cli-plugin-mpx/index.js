const applyBaseMpxConfig = require('./config/base')
const { registerInspectCommand } = require('./commands/inspect')
const { resolveMpWebpackConfig } = require('./config/mp/base')
const { resolveWebWebpackConfig } = require('./config/web/base')
const { registerBuildCommand } = require('./commands/build')
const { registerServeCommand } = require('./commands/serve')
const { getCurrentTarget } = require('./utils')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function (api, options) {
  // register command
  registerBuildCommand(api, options)
  registerServeCommand(api, options)
  registerInspectCommand(api, options)

  api.chainWebpack((config) => {
    // 当前构建的目标
    const currentTarget = getCurrentTarget()
    // 公共配置
    applyBaseMpxConfig(api, options, config)
    // 修改环境配置
    if (currentTarget.mode === 'web') {
      resolveWebWebpackConfig(api, options, config)
    } else {
      resolveMpWebpackConfig(api, options, config, currentTarget)
    }
  })
}

module.exports.MODE = require('./constants/mode')
module.exports.defaultModes = {
  'serve:mp': 'development',
  'serve:web': 'development',
  'build:mp': 'production',
  'build:web': 'production'
}
