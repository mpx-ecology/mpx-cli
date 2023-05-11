const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { getTargets } = require('../../utils/index')
const {
  resolveWebpackConfigByTargets,
  runWebpack,
  runWebpackInChildProcess
} = require('../../utils/webpack')
const { symLinkTargetConfig } = require('../../utils/symlinkTargetConfig')

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
        '--open-child-process': 'open child process',
        '--env': 'custom define __mpx_env__'
      }
    },
    function (args, rawArgv) {
      const watch = !!args.watch
      const customMpxEnv = args.env
      const targets = getTargets(args, options)
      const openChildProcess =
        !!args['open-child-process'] && targets.length > 1

      if (openChildProcess) {
        return runWebpackInChildProcess('build:mp', rawArgv, { targets, watch })
      }

      // 小程序业务代码构建配置
      const webpackConfigs = resolveWebpackConfigByTargets(
        api,
        options,
        targets,
        (webpackConfig, target) => {
          const targetEnv = target.env
          if (targetEnv === 'production' || targetEnv === 'development') {
            webpackConfig.mode(targetEnv === 'production' ? targetEnv : 'none')
            webpackConfig.plugin('define').tap((args) => [
              {
                'process.env.NODE_ENV': `"${targetEnv}"`
              }
            ])
          }
          if (args.report) {
            webpackConfig
              .plugin('bundle-analyzer-plugin')
              .use(BundleAnalyzerPlugin, [{}])
          }
          if (customMpxEnv) {
            webpackConfig.plugin('mpx-webpack-plugin').tap((args) => {
              args[0].env = customMpxEnv
              return args
            })
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
        symLinkTargetConfig(api, targets, webpackConfigs)
        return res
      })
    }
  )
}
