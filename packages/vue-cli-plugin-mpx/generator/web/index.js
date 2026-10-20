module.exports = function (api, options) {
  if (!options.needWeb) return

  if (!api.generator.files['public/index.html']) api.render('./template', options)
  api.extendPackage({
    scripts: {
      'serve:web': 'mpx-cli-service serve --targets=web',
      'build:web': 'mpx-cli-service build --targets=web'
    },
    dependencies: {
      vue: options.vueVersion === '3' ? '^3.2.13' : '^2.7.0',
      pinia: '^2.0.14',
      'vue-demi': '^0.14.6',
      'vue-i18n': '^8.27.2',
      'vue-i18n-bridge': '^9.2.2',
      'vue-router': '^3.1.3'
    }
  })
}
