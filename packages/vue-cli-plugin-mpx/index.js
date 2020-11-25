const registerCommand = require('./utils/registerMpCommand')

module.exports = function (api, options) {
  registerCommand(api, options, 'serve:mp')
  registerCommand(api, options, 'build:mp')
}

module.exports.applyBaseMpxConfig = require('./config/base')
module.exports.applyPluginsMpxConfig = require('./config/plugins')
module.exports.transformMpxEntry = require('./utils/transformMpxEntry')
module.exports.resolveMpxLoader = require('./utils/resolveMpxLoader')
module.exports.resolveMpxWebpackPluginConf = require('./utils/resolveMpxWebpackPluginConf')
module.exports.supportedModes = require('./config/supportedModes')
module.exports.defaultModes = {
  'serve:mp': 'none',
  'build:mp': 'production'
}
