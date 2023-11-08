const { registerServeCommand } = require('./commands/serve')
const { registerBuildCommand } = require('./commands/build')

module.exports = function (api, options) {
  registerServeCommand(api, options)
  registerBuildCommand(api, options)
}

module.exports.defaultModes = {
  'serve:ssr': 'development',
  'build:ssr': 'production'
}
module.exports.defaultModes = {
  serve: 'development',
  build: 'production'
}

module.exports.after = ['vue-cli-plugin-mpx']
