const registerCommand = require('./commands/mp')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { webpack } = require('webpack')

module.exports = function (api, options) {
  api.chainWebpack((webpackConfig) => {
    webpackConfig.cache(true)
    webpackConfig.performance.hints(false)
  })

  registerCommand(api, options, 'serve:mp')
  registerCommand(api, options, 'build:mp')
}

module.exports.defaultModes = {
  'serve:mp': 'none',
  'build:mp': 'production'
}

module.exports.platform = 'mp'
