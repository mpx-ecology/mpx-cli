module.exports.transformMpxEntry = function transformMpxEntry (
  api,
  options = {},
  webpackConfig,
  isWeb = false
) {
  // 通过 cli 生成的默认的入口文件
  let basePath = 'src/app.mpx'

  if (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode')) {
    try {
      const projectConfigJson = require(api.resolve(
        'static/wx/project.config.json'
      ))
      basePath = `src/${projectConfigJson.miniprogramRoot}/app.mpx`
    } catch (e) {}
  }
  const defaultMpxEntry = api.resolve(basePath)
  // 优先取 vue.config.js 当中配置的 entry 入口文件
  const entry =
    (options.pluginOptions &&
      options.pluginOptions.mpx &&
      options.pluginOptions.mpx.entry) ||
    defaultMpxEntry

  if (isWeb) {
    webpackConfig.entry('app').clear()
  }
  // web 需要重置 @vue/cli-service 内置的 app 入口为 mpx 的文件
  webpackConfig.entry('app').add(entry)
}
