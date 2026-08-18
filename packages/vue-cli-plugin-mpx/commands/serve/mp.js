const webpack = require('webpack')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const { symlinkTargetConfig } = require('../../utils/symlink')
const { handleWebpackDone } = require('../../utils/webpack')
const { resolveServeWebpackConfigByTarget } = require('../../config/index')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.serveMp = async function serveMp (api, options, args) {
  const target = getCurrentTarget()
  // 小程序构建配置
  const webpackConfigs = await resolveServeWebpackConfigByTarget(api, options, target, args)
  // 最终配置支持异步修改
  await api.runAfterResolveWebpackCallBack(webpackConfigs)
  // 运行webpack
  return new Promise((resolve, reject) => {
    webpack(webpackConfigs).watch({}, (err, stats) => {
      handleWebpackDone(err, stats, true, options, webpackConfigs[0])
        .then((...res) => {
          if (!options.disabledDefaultLinkFile) {
            symlinkTargetConfig(api, target, webpackConfigs[0], options)
          }
          resolve(...res)
        })
        .catch(reject)
    })
  })
}
