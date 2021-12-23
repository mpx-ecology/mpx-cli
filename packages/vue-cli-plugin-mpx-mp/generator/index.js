module.exports = function (api, options = {}) {
  api.extendPackage({
    devDependencies: {
      'html-loader': '^3.0.1',
      'css-loader': '^0.28.11',
      stylus: '^0.55.0',
      'stylus-loader': '^6.1.0'
    }
  })
}
