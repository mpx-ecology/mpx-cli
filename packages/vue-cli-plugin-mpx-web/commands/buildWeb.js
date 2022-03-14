module.exports = function(api, options) {
  const { build } = api.service.commands

  api.registerCommand('build:web', async function (args, ...p) {
    args.module = args.module || false
    return build.fn(args, ...p)
  })
}
