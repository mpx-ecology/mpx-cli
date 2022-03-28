const registerServeCommand = require('./commands/serveWeb')
const registerBuildCommand = require('./commands/buildWeb')
const applyWebConfig = require('./config')

module.exports = function (api, options) {
  if (options.outputDir === 'dist') {
    options.outputDir = 'dist/web'
  }

  applyWebConfig(api, options)

  registerServeCommand(api, options)
  registerBuildCommand(api, options)
}

module.exports.defaultModes = {
  'serve:web': 'development',
  'build:web': 'production'
}

module.exports.platform = 'web'
