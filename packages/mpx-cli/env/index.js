const path = require('path')
const os = require('os')

module.exports.resetEnv = function () {
  process.env.VUE_CLI_CONFIG_PATH = path.join(os.homedir(), '.mpxrc')
  process.env.VUE_CLI_SERVICE_CONFIG_PATH = './mpx.config.js'
}
