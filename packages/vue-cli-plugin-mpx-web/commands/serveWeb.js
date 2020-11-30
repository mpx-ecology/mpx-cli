module.exports = function(api, options) {
  const { serve } = api.service.commands

  api.registerCommand('serve:web', function (...args) {
    serve.fn(...args)
  })
}
