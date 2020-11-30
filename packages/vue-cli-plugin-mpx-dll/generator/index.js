module.exports = function(api, options) {
  api.extendPackage({
    scripts: {
      'build:dll:mp': 'mpx-cli-service build:dll --mp',
      'build:dll:web': 'mpx-cli-service build:dll --web'
    }
  })

  api.render('./template')
}
