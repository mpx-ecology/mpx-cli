module.exports = function(api, options) {
  api.extendPackage({
    scripts: {
      'watch:web': 'MPX_CLI_MODE=web mpx-cli-service serve:web',
      'build:web': 'MPX_CLI_MODE=web mpx-cli-service build:web'
    }
  })
}
