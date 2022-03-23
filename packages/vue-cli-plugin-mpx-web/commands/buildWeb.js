module.exports = function (api, options) {
  const { build } = api.service.commands

  api.registerCommand('build:web', async function (args, ...p) {
    if (!args.module) {
      return build.fn(args, ...p)
    } else {
      args.module = false
      await build.fn(args, ...p)
      process.env.VUE_CLI_MODERN_BUILD = true
      process.env.VUE_CLI_MODERN_MODE = true
      await build.fn(args, ...p)
    }
  })
}
