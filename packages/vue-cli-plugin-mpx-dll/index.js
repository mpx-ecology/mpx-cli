const registerCommand = require('./commands/buildDll')
const addDllConf = require('./utils/addDllConf')

module.exports = function (api, options) {
  api.chainWebpack(webpackConfig => {
    addDllConf(api, options, webpackConfig, 'web')
  })

  registerCommand(api, options)
}

module.exports.addDllConf = addDllConf
