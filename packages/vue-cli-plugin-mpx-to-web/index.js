const applyWebConfig = require('./config')
const registerServeCommand = require('./commands/serveWeb')
const registerBuildCommand = require('./commands/buildWeb')

module.exports = function(api, options) {
  options.outputDir = 'dist/web'

  registerServeCommand(api, options)
  registerBuildCommand(api, options)
}

module.exports.defaultModes = {
  'serve:web': 'development',
  'build:web': 'production'
}
