const { resolveServeWebpackConfigByTarget } = require('@mpxjs/vue-cli-plugin-mpx/config')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils/lib')
const webpack = require('webpack')
const path = require('path')
const MemoryFS = require('memory-fs')
const { setServerBundle } = require('@mpxjs/cli-shared-utils')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.serveServer = async (api, options, args) => {
  // resolve webpack config
  const target = getCurrentTarget()
  const webpackConfig = resolveServeWebpackConfigByTarget(
    api,
    options,
    target,
    args
  )

  // create compiler
  const serverCompiler = webpack(webpackConfig)

  const mfs = new MemoryFS()
  // 指定输出到的内存流中
  serverCompiler.outputFileSystem = mfs

  serverCompiler.watch({}, (err, stats) => {
    if (err) {
      console.error(err)
      return
    }
    stats = stats.toJson()
    stats.errors.forEach(error => console.error(error))
    stats.warnings.forEach(warn => console.warn(warn))

    const bundlePath = path.join(webpackConfig.output.path, 'vue-ssr-server-bundle.json')

    const serverManifest = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))

    setServerBundle(serverManifest)

    console.info('new bundle generated')
  })

  return new Promise((resolve) => {
    try {
      const devServerPath = path.resolve('server/dev.server')
      require(devServerPath)
    } catch (e) {
      console.warn('can not find dev.server.js')
    }
    resolve()
  })
}
