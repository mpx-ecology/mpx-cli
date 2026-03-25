const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = function (api, options) {
  const target = getCurrentTarget()
  let cloudFuncContext = 'src/functions'
  let cloudFuncDist = 'functions'
  try {
    const projectConfigJson = require(api.resolve(
      `static/${target.mode}/${target.configFile}`
    ))
    cloudFuncContext = `src/${projectConfigJson.cloudfunctionRoot}`
    cloudFuncDist = projectConfigJson.cloudfunctionRoot
  } catch (e) {}

  api.chainWebpack((webpackConfig) => {
    webpackConfig
      .plugin('mpx-cloud-func-copy-webpack-plugin')
      .use(CopyWebpackPlugin, [{
        patterns: [
          {
            context: api.resolve(cloudFuncContext),
            from: '**/*',
            to: `../${cloudFuncDist}/`
          }
        ]
      }])
  })
}

module.exports.platform = 'mp'
