const webpack = require('webpack')
const { parseTarget } = require('@mpxjs/cli-shared-utils')
const { symlinkTargetConfig } = require('../../utils/symlinkTargetConfig')
const {
  resolveWebpackConfigByTarget,
  handleWebpackDone
} = require('../../utils/webpack')

const resolveMpServeWebpackConfig = (api, options, args) => {
  const customMpxEnv = args.env
  const target = parseTarget(args.target, options)
  // 小程序业务代码构建配置
  api.chainWebpack((config) => {
    if (customMpxEnv) {
      config.plugin('mpx-webpack-plugin').tap((args) => {
        args[0].env = customMpxEnv
        return args
      })
    }
  })
  return resolveWebpackConfigByTarget(api, options, target)
}

module.exports.resolveMpServeWebpackConfig = resolveMpServeWebpackConfig

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.serveMp = function serveMp (
  api,
  options,
  args
) {
  const target = api.service.target
  // 小程序业务代码构建配置
  const webpackConfigs = resolveMpServeWebpackConfig(api, options, args)
  return new Promise((resolve, reject) => {
    webpack(webpackConfigs).watch({}, (err, stats) => {
      handleWebpackDone(err, stats, target, api)
        .then((...res) => {
          symlinkTargetConfig(api, target, webpackConfigs[0])
          resolve(...res)
        })
        .catch(reject)
    })
  })
}
