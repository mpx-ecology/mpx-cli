const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

/**
 * 插件配置
 * @param {*} api
 * @param {*} options
 * @param {*} webpackConfig
 */
module.exports = function resolvePluginWebpackConfig (api, options, webpackConfig) {
  let pluginRoot = ''
  try {
    const projectConfigJson = require(api.resolve(
      'static/wx/project.config.json'
    ))
    pluginRoot = projectConfigJson.pluginRoot
  } catch (e) {}

  webpackConfig.entry = {
    plugin: api.resolve(`src/${pluginRoot}/plugin.json`)
  }
  webpackConfig.output = {
    path: api.resolve(`dist/wx/${pluginRoot}`)
  }
  webpackConfig.name = 'plugin-compiler'
  webpackConfig.module.rules.push({
    resource: api.resolve(`src/${pluginRoot}/plugin.json`),
    use: MpxWebpackPlugin.pluginLoader()
  })
}
