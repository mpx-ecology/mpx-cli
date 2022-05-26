const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { logWithSpinner, stopSpinner } = require('@vue/cli-shared-utils')
const execa = require('execa')
const { getTargets, removeArgv } = require('../utils/index')
const {
  resolveWebpackConfigByTargets,
  runWebpack
} = require('../utils/webpack')

const mpxCliServiceBinPath = require.resolve('@mpxjs/mpx-cli-service/bin/mpx-cli-service.js')

module.exports = function registerBuildCommand (api, options) {
  api.registerCommand(
    'build:mp',
    {
      description: 'mp production',
      usage: 'mpx-cli-service build:mp',
      options: {
        '--targets': `compile for target platform, support ${supportedModes}`,
        '--watch': 'compile in watch mode',
        '--report': 'generate report.html to help analyze bundle content',
        '--open-child-process': 'open child process'
      }
    },
    function (args, rawArgv) {
      const isWatching = !!args.watch
      const mode = api.service.mode
      const targets = getTargets(args, options)
      const openChildProcess = !!args['open-child-process']

      const showLoading = () => logWithSpinner(
        '⚓',
        `Building for ${mode} of ${targets.map((v) => v.mode).join(',')}...`
      )

      if (openChildProcess && targets.length > 1) {
        showLoading()
        return Promise.all(targets.map(target => {
          return execa('node', [
            mpxCliServiceBinPath,
            'build:mp',
            ...removeArgv(rawArgv, '--targets'),
            `--targets=${target.mode}:${target.env}`
          ])
        })).then((result) => {
          stopSpinner()
          console.log(result.map(({ stdout }) => stdout).join('\n'))
        })
      }

      if (!openChildProcess) {
        showLoading()
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
            isWatching && target.mode !== 'swan' ? 'source-map' : false
          )
        }
      )

      return runWebpack(webpackConfigs, isWatching)
    }
  )
}
