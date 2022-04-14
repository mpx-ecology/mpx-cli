const registerBuildCommand = require('./commands/build')
const registerServeCommand = require('./commands/serve')
const registerInspectCommand = require('./commands/inspect')

module.exports = function (api, options) {
  registerBuildCommand(api, options)
  registerServeCommand(api, options)
  registerInspectCommand(api, options)
}

module.exports.defaultModes = {
  'serve:mp': 'development',
  'build:mp': 'production'
}

module.exports.platform = 'mp'
