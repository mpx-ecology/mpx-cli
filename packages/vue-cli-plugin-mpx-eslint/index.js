const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = function (api, options, webpackConfig) {
  // TODO: 插件项目的 webpack eslint 配置
  api.chainWebpack(webpackConfig => {
    webpackConfig.plugin('eslint-webpack-plugin').use(new ESLintPlugin())
  })
}
