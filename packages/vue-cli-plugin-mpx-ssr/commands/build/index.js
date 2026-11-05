const { normalizeCommandArgs, getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const withCompilerConfig = require('../../config/withCompilerConfig')
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
    async function build (args) {
      normalizeCommandArgs(args, defaults)
      if (args.clean) {
        fs.removeSync(options.outputDir)
      }

      const buildService = (ssrMode) => withCompilerConfig(api, options, args, ssrMode, addBuildWebpackConfig, async () => {
        const target = getCurrentTarget()
        // 根据目标获取构建配置
        const webpackConfig = await resolveBuildWebpackConfigByTarget(api, options, target, args)
        return new Promise((resolve, reject) => {
          webpack(webpackConfig, (err, stats) => {
            handleWebpackDone(err, stats, false, options, webpackConfig[0])
              .then((...res) => {
                resolve(...res)
              })
              .catch(reject)
          })
        })
      })

      // 两端临时使用同一个 Service 的配置状态，前一端恢复后再启动后一端。
      const client = await buildService('client')
      const server = await buildService('server')
      return [client, server]
    }
  )
}
