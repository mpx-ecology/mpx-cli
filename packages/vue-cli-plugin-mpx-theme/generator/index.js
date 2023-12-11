module.exports = function (api) {
  api.extendPackage({
    devDependencies: {
      'postcss-css-variables': '^0.19.0'
    }
  })
  api.render('./template')
}
