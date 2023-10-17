module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      '@mpxjs/unocss-base': '^2.9.0',
      '@mpxjs/unocss-plugin': '^2.9.0'
    },
    vue: {
      pluginOptions: {
        mpx: {
          unocss: {}
        }
      }
    }
  })

  api.render('./template', options)
}
