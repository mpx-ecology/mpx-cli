module.exports = function (api, options) {
  api.render('./template', options)
  api.extendPackage({
    scripts: {
      'watch:web': 'mpx-cli-service serve:web',
      'build:web': 'mpx-cli-service build:web'
    }
  })
}
