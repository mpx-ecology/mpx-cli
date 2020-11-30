const registerServeCommand = require('./commands/serveWeb')
const registerBuildCommand = require('./commands/buildWeb')

module.exports = function(api, options) {
  options.outputDir = 'dist/web'

  // TODO: webpack 相关的配置全部迁移到外层由 cli-service 来配置生效，registerCommand 内部不适合使用 chainWebpack 再去更改配置，否则 vue.config.js 里面的配置（chainWebpack，configureWebpack）是无法覆盖到的
  registerServeCommand(api, options)
  registerBuildCommand(api, options)
}

module.exports.defaultModes = {
  'serve:web': 'development',
  'build:web': 'production'
}
