module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      '@mpxjs/unocss-base': '^2.8.28-beta.10',
      '@mpxjs/unocss-plugin': '^2.8.28-beta.10'
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
