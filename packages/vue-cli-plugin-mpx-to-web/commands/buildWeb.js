const applyWebConfig = require('../config')

module.exports = function(api, options) {
  const { build } = api.service.commands

  api.registerCommand('build:web', function(...args) {
    applyWebConfig(api, options)
    build.fn(...args)
  })
}
