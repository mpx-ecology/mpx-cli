module.exports = function(api, options) {
  api.extendPackage({
    scripts: {
      'build:dll': 'vue-cli-service build:dll'
    }
  })

  api.render('./template')
}
