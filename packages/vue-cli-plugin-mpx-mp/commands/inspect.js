const { toString } = require('webpack-chain')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { highlight } = require('cli-highlight')
const { getTargets } = require('../utils/index')
const { resolveWebpackConfigByTargets } = require('../utils/webpack')

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

      // 小程序业务代码构建配置
      const res = resolveWebpackConfigByTargets(
        api,
        options,
        targets,
        (webpackConfig, target) => {
          const env = target.env || process.env.NODE_ENV
          if (env === 'production' || env === 'development') {
            webpackConfig.mode(env)
            webpackConfig.plugin('mpx-define-plugin').tap((args) => [
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
        }
      )
      const output = toString(res, { verbose })
      console.log(highlight(output, { language: 'js' }))
    }
  )
}
