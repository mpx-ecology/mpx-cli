module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      windicss: '^3.5.6',
      'windicss-webpack-plugin': '^1.7.8',
      '@mpxjs/windicss-base': '^2.8.28-beta.6',
      '@mpxjs/windicss-plugin': '^2.8.28-beta.8',
      '@mpxjs/webpack-plugin': '^2.8.28-beta.8'
    },
    vue: {
      pluginOptions: {
        mpx: {
          windiPlugin: {}
        }
      }
    }
  })

  api.render('./template', options)
}
