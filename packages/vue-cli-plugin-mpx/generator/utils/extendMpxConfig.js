const mergeConfigSource = require('./mergeConfigSource')

module.exports = function extendMpxConfig (api, config) {
  api.extendPackage({ mpx: config })
  api.render((files) => {
    // 统一在 render 阶段处理，避免默认 JS 转换器执行并序列化用户配置。
    const config = api.generator.pkg.mpx
    if (!config) return
    files['mpx.config.js'] = mergeConfigSource(files['mpx.config.js'], config)
    delete api.generator.pkg.mpx
  })
}
