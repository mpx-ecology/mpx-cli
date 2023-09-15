#!/usr/bin/env node
const { semver, error } = require('@vue/cli-shared-utils')
const requiredVersion = require('../package.json').engines.node
const filterPluginsByPlatform = require('../utils/filterPlugins')
const Service = require('../lib/Service')
const { getTargets, rawTarget } = require('@mpxjs/cli-shared-utils')

if (
  !semver.satisfies(process.version, requiredVersion, {
    includePrerelease: true
  })
) {
  error(
    `You are using Node ${process.version}, but mpx-cli-service ` +
      `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

const rawArgv = process.argv.slice(2)
const args = require('minimist')(rawArgv, {
  boolean: [
    // build
    'modern',
    'report',
    'report-json',
    'inline-vue',
    'watch',
    // serve
    'open',
    'copy',
    'https',
    // inspect
    'verbose'
  ]
})
const targets = getTargets(args)
// wx,ali
targets.forEach((target) => {
  const command = args._[0]
  args.targets = rawTarget(target) // wx
  const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())
  service.target = target
  const setPluginsToSkip = service.setPluginsToSkip.bind(service)
  service.setPluginsToSkip = function (args) {
    setPluginsToSkip(args, rawArgv)
    let plugins = filterPluginsByPlatform(process.env.MPX_CLI_MODE)
    // 小程序模式下，将 @vue/cli-service 内置的 base 及 app 配置过滤掉
    if (process.env.MPX_CLI_MODE !== 'web') {
      plugins = plugins.concat([
        'built-in:config/base',
        'built-in:config/app',
        'built-in:config/css'
      ])
    }
    plugins.forEach((plugin) => {
      this.pluginsToSkip.add(plugin)
    })
  }
  // 收集插件，运行Config.js
  // build => resolveChainWebpack
  service.run(command, args, rawArgv).catch((err) => {
    error(err)
    process.exit(1)
  })
})
