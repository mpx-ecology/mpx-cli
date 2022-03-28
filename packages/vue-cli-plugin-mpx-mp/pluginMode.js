const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

module.exports = function (api, options, webpackConfig) {
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
