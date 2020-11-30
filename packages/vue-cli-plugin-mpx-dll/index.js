const registerCommand = require('./commands/buildDll')
const addDllConf = require('./utils/addDllConf')

module.exports = function (api, options) {
  api.chainWebpack(webpackConfig => {
    const mode = process.env.MPX_CLI_MODE
    addDllConf(api, options, webpackConfig, mode)
  })

  registerCommand(api, options)
}

module.exports.addDllConf = addDllConf
