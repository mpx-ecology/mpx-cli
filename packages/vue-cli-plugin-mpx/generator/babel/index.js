module.exports = function (api, options) {
  const needRn = options.needRn
  api.render('./template', {
    needRn
  })
  api.extendPackage({
    devDependencies: {
      '@babel/core': '^7.10.4',
      '@babel/plugin-transform-runtime': '^7.10.4',
      '@babel/preset-env': '^7.10.4',
      '@babel/runtime-corejs3': '^7.10.4'
    }
  })
  if (needRn) {
    api.extendPackage({
      devDependencies: {
        '@babel/preset-react': '^7.24.7'
      }
    })
  }
}
