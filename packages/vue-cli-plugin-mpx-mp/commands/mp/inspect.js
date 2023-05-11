const { toString } = require('webpack-chain')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { highlight } = require('cli-highlight')
const { getTargets } = require('../../utils/index')
const { resolveWebpackConfigByTargets } = require('../../utils/webpack')

module.exports = function registerInspectCommand (api, options) {
  api.registerCommand(
    'inspect:mp',
    {
      description: 'inspect mp',
      usage: 'mpx-cli-service inspect:mp'
    },
    function (args) {
      const targets = getTargets(args, options)
      const { verbose } = args
      const customMpxEnv = args.env

      // 小程序业务代码构建配置
      const res = resolveWebpackConfigByTargets(
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
        }
      )
      const output = toString(res, { verbose })
      console.log(highlight(output, { language: 'js' }))
    }
  )
}
