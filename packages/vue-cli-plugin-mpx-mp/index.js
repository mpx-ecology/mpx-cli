const registerMpBuildCommand = require('./commands/build')
const registerMpServeCommand = require('./commands/serve')

module.exports = function (api, options) {
  registerMpBuildCommand(api, options)
  registerMpServeCommand(api, options)
}

module.exports.defaultModes = {
  'serve:mp': 'development',
  'build:mp': 'production'
}

module.exports.platform = 'mp'
