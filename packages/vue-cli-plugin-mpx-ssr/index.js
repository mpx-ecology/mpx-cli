const registerServeCommand = require('./commands/serve')
const registerBuildCommand = require('./commands/build')
const registerInspectCommand = require('./commands/inspect')
const applyWebConfig = require('./config/index')

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
  'build:web': 'production',
  'inspect:web': 'development'
}
module.exports.defaultModes = {
  serve: 'development',
  build: 'production',
  inspect: 'development'
}

module.exports.after = ['']
