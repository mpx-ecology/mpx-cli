module.exports = function (api, options) {
  const { build } = api.service.commands

  async function legacyBuild(args, ...p) {
    process.env.VUE_CLI_MODERN_BUILD = false
    process.env.VUE_CLI_MODERN_MODE = true
    await build.fn(
      {
        ...args,
        module: false,
        moduleBuild: false,
        keepAlive: true
      },
      ...p
    )
  }

  async function moduleBuild(args, ...p) {
    process.env.VUE_CLI_MODERN_BUILD = true
    process.env.VUE_CLI_MODERN_MODE = true
    await build.fn(
      {
        ...args,
        module: true,
        moduleBuild: true,
        clean: false
      },
      ...p
    )
  }

  api.registerCommand('build:web', async function (args, ...p) {
    if (args.module === false) {
      return build.fn(args, ...p)
    } else {
      await legacyBuild({ ...args }, ...p)
      await moduleBuild({ ...args }, ...p)
    }
  })
}
