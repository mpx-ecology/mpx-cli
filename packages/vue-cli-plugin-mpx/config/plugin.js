const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const path = require('path')
const { merge } = require('webpack-merge')

/**
 * 插件配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('webpack').Configuration } webpackConfig
 */
module.exports.resolvePluginWebpackConfig = function resolvePluginWebpackConfig (
  api,
  webpackConfig
) {
  let pluginRoot = ''
  try {
    const projectConfigJson = require(api.resolve(
      'static/wx/project.config.json'
    ))
    pluginRoot = projectConfigJson.pluginRoot
  } catch (e) {}

  webpackConfig.entry = {
    plugin: MpxWebpackPlugin.getPluginEntry(
      api.resolve(`src/${pluginRoot}/plugin.json`)
    )
  }
  webpackConfig.output = {
    path: api.resolve(
      `${path.resolve(webpackConfig.output.path, '../')}/${pluginRoot}`
    )
  }
  webpackConfig.name = 'plugin-compiler'
  return merge({}, webpackConfig)
}
