const {
  getCurrentTarget,
  SUPPORT_MODE,
  normalizeCommandArgs
} = require('@mpxjs/cli-shared-utils')
const webpack = require('webpack')
const fs = require('fs-extra')
const { handleWebpackDone } = require('../../utils/webpack')
const { symlinkTargetConfig } = require('../../utils/symlink')
const { resolveBuildWebpackConfigByTarget } = require('../../config')
const { addBuildWebpackConfig } = require('../../config/base')

const defaults = {
  clean: true
}

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.registerBuildCommand = function (api, options) {
  api.registerCommand(
    'build',
    {
      description: 'mpx production',
      usage: 'mpx-cli-service build',
      options: {
        '--targets': `compile for target platform, support ${SUPPORT_MODE}`,
        '--watch': 'compile in watch mode',
        '--mode': 'specify env mode (default: production)',
        '--report': 'generate report.html to help analyze bundle content',
        '--no-clean':
          'do not remove the dist directory contents before building the project',
        '--env': 'custom define __mpx_env__'
      }
    },
    function build (args, rawArgv) {
      normalizeCommandArgs(args, defaults)
      if (args.clean) {
        fs.removeSync(options.outputDir)
      }
      const target = getCurrentTarget()
      // 根据命令参数添加动态配置
      api.chainWebpack((config) => {
        addBuildWebpackConfig(api, options, config, target, args)
      })
      // 根据目标获取构建配置
      const webpackConfig = resolveBuildWebpackConfigByTarget(
        api,
        options,
        target,
        args
      )
      return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
          handleWebpackDone(err, stats, args.watch)
            .then((...res) => {
              if (target !== 'web') {
                // web版本不需要symlink
                symlinkTargetConfig(api, target, webpackConfig[0])
              }
              resolve(...res)
            })
            .catch(reject)
        })
      })
    }
  )
}
