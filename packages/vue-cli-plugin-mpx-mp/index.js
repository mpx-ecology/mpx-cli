const registerBuildCommand = require('./commands/build')
const registerServeCommand = require('./commands/serve')
const registerInspectCommand = require('./commands/inspect')
const { transformMpxEntry } = require('@mpxjs/vue-cli-plugin-mpx')
const resolveBaseWebpackConfig = require('./config/base')
const { resolveTargetConfig } = require('./config/target')
const { currentTarget } = require('./utils/webpack')

module.exports = function (api, options) {
  registerBuildCommand(api, options)
  registerServeCommand(api, options)
  registerInspectCommand(api, options)
  api.chainWebpack((config) => {
    // 修改基础配置
    resolveBaseWebpackConfig(api, options, config, currentTarget)
    // 根据不同target修改webpack配置
    resolveTargetConfig(api, options, config, currentTarget)
    // 转换entry
    transformMpxEntry(api, options, config)
  })
}

module.exports.defaultModes = {
  'serve:mp': 'development',
  'build:mp': 'production',
  'inspect:mp': 'development'
}

module.exports.platform = 'mp'
