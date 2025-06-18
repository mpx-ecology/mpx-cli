const webpack = require('webpack')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const { symlinkTargetConfig } = require('../../utils/symlink')
const { handleWebpackDone } = require('../../utils/webpack')
const { resolveServeWebpackConfigByTarget } = require('../../config/index')
const { createDevServer } = require('./utils')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.serveMp = async function serveMp (api, options, args) {
  const target = getCurrentTarget()
  // 小程序构建配置
  const webpackConfigs = await resolveServeWebpackConfigByTarget(
    api,
    options,
    target,
    args
  )

  // create compiler
  const compiler = webpack(webpackConfigs)

  // resolve devServer options
  const projectDevServerOptions = webpackConfigs[0].devServer || {}

  // create dev server instance
  const { server } = await createDevServer(
    api,
    options,
    args,
    projectDevServerOptions,
    compiler
  )

  return new Promise((resolve, reject) => {
    // // handle compiler error
    // compiler.hooks.failed.tap('mpx-cli-service serve', (msg) => {
    //   reject(msg)
    // })

    compiler.hooks.done.tap('vue-cli-service serve', (stats) => {
      handleWebpackDone(null, stats, true)
        .then((...res) => {
          if (!options.disabledDefaultLinkFile) {
            symlinkTargetConfig(api, target, webpackConfigs[0])
          }
          resolve(...res)
        })
        .catch(reject)
    })

    server.start().catch((err) => reject(err))
  })
}
