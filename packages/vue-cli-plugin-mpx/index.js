const applyBaseMpxConfig = require('./config/base')

module.exports = function (api, options) {
  api.chainWebpack(webpackConfig => {
    applyBaseMpxConfig(api, options, webpackConfig)
  })
}

module.exports.transformMpxEntry = require('./utils/transformMpxEntry')
module.exports.resolveMpxLoader = require('./utils/resolveMpxLoader')
module.exports.resolveMpxWebpackPluginConf = require('./utils/resolveMpxWebpackPluginConf')
module.exports.supportedModes = require('./config/supportedModes')
module.exports.defaultModes = {
  'serve:mp': 'development',
  'build:mp': 'production'
}
