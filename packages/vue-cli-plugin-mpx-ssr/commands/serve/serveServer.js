const { resolveServeWebpackConfigByTarget } = require('@mpxjs/vue-cli-plugin-mpx/config')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils/lib')
const MemoryFS = require('memory-fs')
const { mfs } = require('@mpxjs/cli-shared-utils')
const webpack = require('webpack')
const path = require('path')

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

// 指定输出到的内存流中
  serverCompiler.outputFileSystem = mfs

  return new Promise((resolve, reject) => {
    serverCompiler.watch({}, (err, stats) =>{
      if (err) {
        reject(err)
      }
      stats = stats.toJson()
      stats.errors.forEach(error => console.error(error) )
      stats.warnings.forEach( warn => console.warn(warn) )
      // const bundlePath = path.join(
      //   // webpackConfig.output.path,
      //   '/Users/didi/Documents/Work/Code/mpx-cli/packages/test/test-ssr/dist/web',
      //   'vue-ssr-server-bundle.json'
      // )
      const bundlePath = '/Users/didi/Documents/Work/Code/mpx-cli/packages/test/test-ssr/dist/web/vue-ssr-server-bundle.json'
      const serverManifest = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
      global.a = 111111
      console.log('11111serverManifest', serverManifest)
      console.info('new bundle generated')
      resolve('new bundle generated')
    })

  })
}
