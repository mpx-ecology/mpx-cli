module.exports = function (api, options = {}) {
  api.extendPackage({
    devDependencies: {
      'html-loader': '^3.0.1',
      'css-loader': '^0.28.11',
      stylus: '^0.54.5',
      'stylus-loader': '^3.0.2'
    }
  })
}
