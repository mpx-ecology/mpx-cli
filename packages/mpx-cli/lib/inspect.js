const fs = require('fs')
const path = require('path')
const resolve = require('resolve')
const { execa } = require('@vue/cli-shared-utils')

module.exports = function inspect (paths, args) {
  const cwd = process.cwd()
  let servicePath
  try {
    servicePath = resolve.sync('@mpxjs/mpx-cli-service', { basedir: cwd })
  } catch (e) {
    const { error } = require('@vue/cli-shared-utils')
    error(
      'Failed to locate @mpxjs/mpx-cli-service.\n' +
      'Note that `mpx inspect` is an alias of `@mpxjs/mpx-cli-service inspect`\n' +
      'and can only be used in a project where @mpxjs/mpx-cli-service is locally installed.'
    )
    process.exit(1)
  }
  const binPath = path.resolve(servicePath, '../../bin/mpx-cli-service.js')
  if (fs.existsSync(binPath)) {
    execa('node', [
      binPath,
      'inspect',
      ...(args.mode ? ['--mode', args.mode] : []),
      ...(args.targets ? ['--targets', args.targets] : []),
      ...(args.env ? ['--env', args.env] : []),
      ...(args.rule ? ['--rule', args.rule] : []),
      ...(args.plugin ? ['--plugin', args.plugin] : []),
      ...(args.rules ? ['--rules'] : []),
      ...(args.plugins ? ['--plugins'] : []),
      ...(args.verbose ? ['--verbose'] : []),
      ...paths
    ], { cwd, stdio: 'inherit' })
  }
}
