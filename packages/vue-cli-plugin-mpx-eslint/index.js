const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = function (api, options, webpackConfig) {
  if (options.lintOnSave) {
    api.chainWebpack((webpackConfig) => {
      const { lintOnSave } = options
      const extensions = ['js', 'ts', 'mpx']
      const treatAllAsWarnings = lintOnSave === true || lintOnSave === 'warning'
      const treatAllAsErrors = lintOnSave === 'error'

      const failOnWarning = treatAllAsErrors
      const failOnError = !treatAllAsWarnings

      /** @type {import('eslint-webpack-plugin').Options & import('eslint').ESLint.Options} */
      const eslintWebpackPluginOptions = {
        // common to both plugin and ESlint
        extensions,
        // ESlint options
        failOnWarning,
        failOnError
      }

      webpackConfig
        .plugin('eslint-webpack-plugin')
        .use(ESLintPlugin, [eslintWebpackPluginOptions])
    })
  }
}
