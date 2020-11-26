module.exports = function(api, options) {
  api.extendPackage({
    scripts: {
      'watch:web': 'MPX_CLI_MODE=web vue-cli-service serve:web',
      'build:web': 'MPX_CLI_MODE=web vue-cli-service build:web'
    }
  })
}
