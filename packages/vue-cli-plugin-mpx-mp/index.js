const registerCommand = require('./commands/mp')
const { resolveMpxLoader } = require('@mpxjs/vue-cli-plugin-mpx')

module.exports = function (api, options) {
  api.chainWebpack(webpackConfig => {
    webpackConfig.cache(true)
    webpackConfig.performance.hints(false)

    const mpxLoader = resolveMpxLoader(api, options)
    webpackConfig.module
      .rule('mpx')
      .test(/\.mpx$/)
      .use('mpx-loader')
      .loader(mpxLoader.loader)
      .options(mpxLoader.options)
  })

  registerCommand(api, options, 'serve:mp')
  registerCommand(api, options, 'build:mp')
}

module.exports.defaultModes = {
  'serve:mp': 'none',
  'build:mp': 'production'
}

module.exports.platform = 'mp'
