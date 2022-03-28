module.exports = function (api, options) {
  const { serve } = api.service.commands

  api.registerCommand('serve:web', async function (...args) {
    return serve.fn(...args)
  })
}
