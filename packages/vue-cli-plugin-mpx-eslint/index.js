const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = function (api, options, webpackConfig) {
  api.chainWebpack(webpackConfig => {
    webpackConfig.plugin('eslint-webpack-plugin').use(ESLintPlugin, [{
      extensions: ['js', 'mpx']
    }])
  })
}
