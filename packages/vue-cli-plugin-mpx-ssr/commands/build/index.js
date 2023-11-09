const { normalizeCommandArgs } = require('@mpxjs/cli-shared-utils')
const { addBuildWebpackConfig } = require('../../config/build.config')
const { resolveBuildWebpackConfigByTarget } = require('@mpxjs/vue-cli-plugin-mpx/config')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const { handleWebpackDone } = require('@mpxjs/vue-cli-plugin-mpx/utils/webpack')
const webpack = require('webpack')

const defaults = {
  clean: true
}

module.exports.registerBuildCommand = function (api, options) {
  api.registerCommand(
    'build:ssr',
    {
      description: 'mpx production',
      usage: 'mpx-cli-service build',
      options: {
        '--ssrMode': 'compile for target environment, support client, server',
        '--no-clean':
          'do not remove the dist directory contents before building the project'
      }
    },
    function build (args) {
      normalizeCommandArgs(args, defaults)
      // if (args.clean) {
      //   fs.removeSync(options.outputDir)
      // }
      api.chainWebpack((config) => {
        addBuildWebpackConfig(api, options, args, config)
      })
      const target = getCurrentTarget()
      // 根据目标获取构建配置
      const webpackConfig = resolveBuildWebpackConfigByTarget(
        api,
        options,
        target,
        args
      )
      return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
          handleWebpackDone(err, stats, target, api)
            .then((...res) => {
              resolve(...res)
            })
            .catch(reject)
        })
      })
    }
  )
}
