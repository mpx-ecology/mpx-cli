module.exports = function(api, options) {
  api.render('./template', options)
  api.extendPackage({
    scripts: {
      'watch:web': 'MPX_CLI_MODE=web mpx-cli-service serve:web',
      'build:web': 'MPX_CLI_MODE=web mpx-cli-service build:web'
    },
    devDependencies: {
      'html-loader': '^3.0.1',
      'css-loader': '^0.28.11',
      stylus: '^0.54.5',
      'stylus-loader': '^3.0.2',
      "vue-style-loader": "^4.1.2",
    }
  })
}
