const { modifyMpxPluginConfig } = require('@mpxjs/cli-shared-utils/lib')

module.exports = function (api, options) {
  let importThemeFiles = []
  try {
    importThemeFiles = options.pluginOptions.themeFilePath || []
  } catch (e) {}

  const { postCssVariables = {} } = options.pluginOptions || {}
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
          import: importThemeFiles
        }
      })
      .end()
  })
}

module.exports.after = ['@mpxjs/vue-cli-plugin-mpx']
