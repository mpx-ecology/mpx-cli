const applyWebConfig = require('../config')

module.exports = function(api, options) {
  const { serve } = api.service.commands

  api.registerCommand('serve:web', function (...args) {
    applyWebConfig(api, options)
    serve.fn(...args)
  })
}
