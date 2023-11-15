const { normalizeCommandArgs } = require('@mpxjs/cli-shared-utils')
const { addBaseWebpackConfig } = require('../../config/base.config')
const { addBuildWebpackConfig } = require('../../config/build.config')
const { resolveBuildWebpackConfigByTarget } = require('@mpxjs/vue-cli-plugin-mpx/config')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const { handleWebpackDone } = require('@mpxjs/vue-cli-plugin-mpx/utils/webpack')
const webpack = require('webpack')
const fs = require('fs-extra')

const defaults = {
  clean: true
}

module.exports.registerBuildCommand = function (api, options) {
  api.registerCommand(
    'build:ssr',
    {
      description: 'mpx production',
      usage: 'mpx-cli-service build ssr'
    },
    function build (args) {
      normalizeCommandArgs(args, defaults)
      if (args.clean) {
        fs.removeSync(options.outputDir)
      }

      const getBaseConfig = (ssrMode) => {
        api.chainWebpack((config) => {
          addBaseWebpackConfig(api, options, args, config, { ssrMode })
          addBuildWebpackConfig(api, options, args, config, { ssrMode })
        })
        const target = getCurrentTarget()
        // 根据目标获取构建配置
        const webpackConfig = resolveBuildWebpackConfigByTarget(api, options, target, args)
        return {
          webpackConfig,
          target
        }
      }

      const buildService = (ssrMode) => {
        return new Promise((resolve, reject) => {
          const { webpackConfig, target } = getBaseConfig(ssrMode)
          webpack(webpackConfig, (err, stats) => {
            handleWebpackDone(err, stats, target, api)
              .then((...res) => {
                resolve(...res)
              })
              .catch(reject)
          })
        })
      }

      return Promise.all([buildService('client'), buildService('server')])
    }
  )
}
