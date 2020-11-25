// TODO: 看是否能在 @mpxjs/webpack-plugin 内部做下处理？
module.exports = function transformMpxEntry(api, options = {}, webpackConfig, isWeb) {
  // 通过 cli 生成的默认的入口文件
  const defaultMpxEntry = api.resolve('src/app.mpx')
  // 优先取 vue.config.js 当中配置的 entry 入口文件
  const entry =
    (options.pluginOptions &&
      options.pluginOptions.mpx &&
      options.pluginOptions.mpx.entry) ||
    defaultMpxEntry

  if (!isWeb) {
    // 暂时做下兼容，webpackConfig.entry('app').clear().add(entryPath) 这种格式在 mpx-plugin 最终处理会有格式问题
    webpackConfig.entry = {
      app: entry
    }
  } else {
    // web 需要重置 @vue/cli-service 内置的 app 入口为 mpx 的文件
    webpackConfig.entry('app').clear().add(entry)
  }
}
