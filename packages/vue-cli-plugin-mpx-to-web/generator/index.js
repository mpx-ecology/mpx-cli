module.exports = function(api, options) {
  api.extendPackage({
    scripts: {
      'watch:web': 'vue-cli-service serve:web',
      'build:web': 'vue-cli-service build:web'
    }
  })
}
