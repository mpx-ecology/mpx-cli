const { getCurrentTarget } = require('./target')

function getWebpackName (api, target, pluginConfig) {
  return [target.mode, pluginConfig.env, api.service.mode]
    .filter((v) => v !== undefined)
    .join('-')
}

function modifyConfig (config, fn) {
  if (Array.isArray(config)) {
    config.forEach((c) => fn(c))
  } else {
    fn(config)
  }
}

function modifyMpxPluginConfig (api, config, pluginConfig) {
  config.plugin('mpx-webpack-plugin').tap((args) => {
    Object.assign(args[0], pluginConfig)
    return args
  })
  updateWebpackName(api, config)
}

function updateWebpackName (api, config) {
  const mpxWebpackPluginConfig = config
    .plugin('mpx-webpack-plugin')
    .get('args')[0]
  const name = getWebpackName(api, getCurrentTarget(), mpxWebpackPluginConfig)
  config.name(name)
  config.plugin('webpackbar').tap((args) => {
    const c = args[0]
    c.name = name
    c.reporter.name = c.name
    return args
  })
}

module.exports.getWebpackName = getWebpackName
module.exports.modifyMpxPluginConfig = modifyMpxPluginConfig
module.exports.updateWebpackName = updateWebpackName
module.exports.modifyConfig = modifyConfig
