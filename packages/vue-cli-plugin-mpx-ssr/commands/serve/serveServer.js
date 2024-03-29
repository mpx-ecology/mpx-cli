const { resolveServeWebpackConfigByTarget } = require('@mpxjs/vue-cli-plugin-mpx/config')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils/lib')
const { getReporter } = require('@mpxjs/vue-cli-plugin-mpx/utils/reporter')
const { chalk } = require('@vue/cli-shared-utils')
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

  return new Promise((resolve, reject) => {
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

      getReporter()._renderStates([{
        message: 'new server bundle generated',
        color: 'green'
      }])
    })
    try {
      require(api.resolve('server/dev.server'))
    } catch (e) {
      reject(e)
    }
    resolve()
  })
}
