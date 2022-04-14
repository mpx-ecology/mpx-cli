const { toString } = require('webpack-chain')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { highlight } = require('cli-highlight')
const { getTargets } = require('../utils/index')
const { resolveWebpackConfigByTargets } = require('../utils/webpack')

module.exports = function registerMpBuildCommand (api, options) {
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
        (webpackConfig) => {
          if (process.env.NODE_ENV === 'production') {
            webpackConfig.mode('production')
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
