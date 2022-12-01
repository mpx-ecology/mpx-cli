module.exports = function (api, options) {
  api.render('./template')

  api.extendPackage({
    devDependencies: {
      '@babel/core': '^7.10.4',
      '@babel/plugin-transform-runtime': '^7.10.4',
      '@babel/preset-env': '^7.10.4',
      '@babel/runtime-corejs3': '^7.10.4'
    }
  })
}
