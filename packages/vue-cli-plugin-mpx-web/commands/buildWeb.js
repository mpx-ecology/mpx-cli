module.exports = function(api, options) {
  const { build } = api.service.commands

  api.registerCommand('build:web', async function (...args) {
    return build.fn(...args)
  })
}
