const registerServeCommand = require('./commands/serve')
const registerBuildCommand = require('./commands/build')
const registerInspectCommand = require('./commands/inspect')
const applyWebConfig = require('./config')

module.exports = function (api, options) {
  if (options.outputDir === 'dist') {
    options.outputDir = 'dist/web'
  }

  api.extendPackage({
    'vue-demi': '^0.13.11',
    'vue-i18n': '^8.27.2',
    'vue-i18n-bridge': '^9.2.2',
    'vue-router': '^3.1.3'
  })

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

module.exports.platform = 'web'
