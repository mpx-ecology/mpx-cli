const webpack = require('webpack')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const { symlinkTargetConfig } = require('../../utils/symlink')
const { handleWebpackDone } = require('../../utils/webpack')
const { resolveServeWebpackConfigByTarget } = require('../../config/index')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.serveMp = function serveMp (api, options, args) {
  const target = getCurrentTarget()
  // 小程序构建配置
  const webpackConfigs = resolveServeWebpackConfigByTarget(api, options, target, args)
  return new Promise((resolve, reject) => {
    webpack(webpackConfigs).watch({}, (err, stats) => {
      handleWebpackDone(err, stats, true)
        .then((...res) => {
          symlinkTargetConfig(api, target, webpackConfigs[0])
          resolve(...res)
        })
        .catch(reject)
    })
  })
}
