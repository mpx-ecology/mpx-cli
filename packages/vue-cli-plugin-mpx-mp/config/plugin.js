const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const path = require('path')

/**
 * 插件配置
 * @param {*} api
 * @param {*} options
 * @param {*} webpackConfig
 */
module.exports = function resolvePluginWebpackConfig (
  api,
  options,
  wxWebpackConfig
) {
  let pluginRoot = ''
  try {
    const projectConfigJson = require(api.resolve(
      'static/wx/project.config.json'
    ))
    pluginRoot = projectConfigJson.pluginRoot
  } catch (e) {}

  wxWebpackConfig.entry = {
    plugin: MpxWebpackPlugin.getPluginEntry(
      api.resolve(`src/${pluginRoot}/plugin.json`)
    )
  }
  wxWebpackConfig.output = {
    path: api.resolve(
      `${path.resolve(wxWebpackConfig.output.path, '../')}/${pluginRoot}`
    )
  }
  wxWebpackConfig.name = 'plugin-compiler'

  return wxWebpackConfig
}
