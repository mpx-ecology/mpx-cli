module.exports = function (api, options) {
  let importThemeFiles = []
  try {
    importThemeFiles = options.pluginOptions.themeFilePath || []
  } catch (e) {}

  api.chainWebpack((config) => {
    config.module
      .rule('stylus')
      .oneOf('mpx')
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

module.exports.after = [
  '@mpxjs/vue-cli-plugin-mpx'
]
