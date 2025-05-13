const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = function (api, options, webpackConfig) {
  if (options.lintOnSave) {
    api.chainWebpack((webpackConfig) => {
      const extensions = ['js', 'ts', 'mpx']

      /** @type {import('eslint-webpack-plugin').Options & import('eslint').ESLint.Options} */
      const eslintWebpackPluginOptions = {
        // common to both plugin and ESlint
        extensions,
        // ESlint options 全部禁用
        // 5.x的eslint-webpack-plugin这两个选项是控制是否退出构建的，但是eslint错误上不应该退出构建，所以这里全部禁用
        failOnWarning: false,
        failOnError: false,
        cache: false
      }

      webpackConfig
        .plugin('eslint-webpack-plugin')
        .use(ESLintPlugin, [eslintWebpackPluginOptions])
    })
  }
}
