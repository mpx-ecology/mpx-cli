const { modifyMpxPluginConfig } = require('@mpxjs/cli-shared-utils/lib')

module.exports = function (api, options) {
  const { postCssVariables = {}, themeFilePath = [] } = options.pluginOptions || {}

  api.chainWebpack((config) => {
    modifyMpxPluginConfig(api, config, {
      postcssInlineConfig: {
        plugins: [
          require('postcss-css-variables')({
            preserve: true,
            ...postCssVariables
          })
        ]
      }
    })

    config.module
      .rule('stylus')
      .oneOf('normal')
      .use('stylus-loader')
      .loader('stylus-loader')
      .options({
        stylusOptions: {
          import: themeFilePath
        }
      })
      .end()
  })
}

module.exports.after = ['@mpxjs/vue-cli-plugin-mpx']
