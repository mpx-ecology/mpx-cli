const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = function (api, options) {
  let cloudFuncContext = 'src/functions'
  let cloudFuncDist = 'functions'
  try {
    const projectConfigJson = require(api.resolve(
      'static/wx/project.config.json'
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
