module.exports = function (api, options) {
  const { inspect } = api.service.commands

  api.registerCommand('inspect:web', async function (...args) {
    return inspect.fn(...args)
  })
}
