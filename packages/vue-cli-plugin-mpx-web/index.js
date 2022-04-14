const registerServeCommand = require('./commands/serve')
const registerBuildCommand = require('./commands/build')
const registerInspectCommand = require('./commands/build')
const applyWebConfig = require('./config')

module.exports = function (api, options) {
  if (options.outputDir === 'dist') {
    options.outputDir = 'dist/web'
  }

  applyWebConfig(api, options)

  registerServeCommand(api, options)
  registerBuildCommand(api, options)
  registerInspectCommand(api, options)
}

module.exports.defaultModes = {
  'serve:web': 'development',
  'build:web': 'production'
}

module.exports.platform = 'web'
