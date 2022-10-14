const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { logWithSpinner } = require('@vue/cli-shared-utils')
const fs = require('fs')
const path = require('path')
const { getTargets } = require('../utils/index')
const {
  resolveWebpackConfigByTargets,
  runWebpack,
  runWebpackInChildProcess
} = require('../utils/webpack')

module.exports = function registerBuildCommand (api, options) {
  api.registerCommand(
    'build:mp',
    {
      description: 'mp production',
      usage: 'mpx-cli-service build:mp',
      options: {
        '--targets': `compile for target platform, support ${MODE.SUPPORT_MODE}`,
        '--watch': 'compile in watch mode',
        '--report': 'generate report.html to help analyze bundle content',
        '--open-child-process': 'open child process'
      }
    },
    function (args, rawArgv) {
      const watch = !!args.watch
      const mode = api.service.mode
      const targets = getTargets(args, options)
      const openChildProcess =
        !!args['open-child-process'] && targets.length > 1

      logWithSpinner(
        '⚓',
        `Building for ${mode} of ${targets.map((v) => v.mode).join(',')}...`
      )

      if (openChildProcess) {
        return runWebpackInChildProcess('build:mp', rawArgv, { targets, watch })
      }

      // 小程序业务代码构建配置
      const webpackConfigs = resolveWebpackConfigByTargets(
        api,
        options,
        targets,
        (webpackConfig, target) => {
          const env = target.env
          if (env === 'production' || env === 'development') {
            webpackConfig.mode(env)
            webpackConfig.plugin('mpx-define-plugin').tap(() => [
              {
                'process.env.NODE_ENV': `"${env}"`
              }
            ])
          }
          if (args.report) {
            webpackConfig
              .plugin('bundle-analyzer-plugin')
              .use(BundleAnalyzerPlugin, [{}])
          }
          // 仅在watch模式下生产sourcemap
          // 百度小程序不开启sourcemap，开启会有模板渲染问题
          webpackConfig.devtool(
            watch && target.mode !== 'swan' ? 'source-map' : false
          )
        }
      )

      return runWebpack(webpackConfigs, {
        watch
      }).then((res) => {
        targets.forEach((target, k) => {
          const config = webpackConfigs[k]
          const outputPath = config.output.path
          if (outputPath) {
            const targetConfigFiles = MODE.MODE_CONFIG_FILES_MAP[target] || []
            targetConfigFiles.forEach(v => {
              try {
                fs.symlinkSync(
                  api.resolve(`static/${target}/${v}`),
                  path.resolve(outputPath, v)
                )
              } catch (error) {

              }
            })
          }
        })
        return res
      })
    }
  )
}
