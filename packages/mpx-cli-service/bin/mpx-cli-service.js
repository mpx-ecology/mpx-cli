#!/usr/bin/env node

const { semver, error } = require('@vue/cli-shared-utils')
const requiredVersion = require('../package.json').engines.node

if (!semver.satisfies(process.version, requiredVersion, { includePrerelease: true })) {
  error(
    `You are using Node ${process.version}, but mpx-cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

const Service = require('../lib/Service')
const { parseTarget } = require('@mpxjs/vue-cli-plugin-mpx/utils')
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())
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
const command = args._[0]
process.env.MPX_CLI_MODE = command.split(':')[1] || 'mp'

const { env } = parseTarget(args.target)

// 优先wx:production 然后是 --mode=production
service.run(command, { ...args, mode: env || args.mode }, rawArgv).catch((err) => {
  error(err)
  process.exit(1)
})
