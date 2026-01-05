const { normalizeCommandArgs, getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const { addBaseWebpackConfig } = require('../../config/base.config')
const { addBuildWebpackConfig } = require('../../config/build.config')
const { resolveBuildWebpackConfigByTarget } = require('@mpxjs/vue-cli-plugin-mpx/config')
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

      const getBaseConfig = async (ssrMode) => {
        api.chainWebpack((config) => {
          addBaseWebpackConfig(api, options, args, config, { ssrMode })
          addBuildWebpackConfig(api, options, args, config, { ssrMode })
        })
        const target = getCurrentTarget()
        // 根据目标获取构建配置
        const webpackConfig = await resolveBuildWebpackConfigByTarget(api, options, target, args)
        return {
          webpackConfig,
          target
        }
      }

      const buildService = async (ssrMode) => {
        const { webpackConfig, target } = await getBaseConfig(ssrMode)
        return new Promise((resolve, reject) => {
          webpack(webpackConfig, (err, stats) => {
            // todo：此处target应该是一个布尔值，判断是否watch, 直接把target和api替换掉有问题嘛，当前只将api换为了options
            handleWebpackDone(err, stats, target, options)
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
