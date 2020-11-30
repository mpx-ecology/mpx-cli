module.exports = function(api, options) {
  const { build } = api.service.commands

  api.registerCommand('build:web', function(...args) {
    build.fn(...args)
  })
}
