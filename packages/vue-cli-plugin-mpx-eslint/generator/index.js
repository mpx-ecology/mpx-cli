module.exports = function (api, options = {}) {
  const deps = {
    scripts: {
      lint: 'eslint --ext .js,.ts,.mpx src/'
    },
    devDependencies: {
      eslint: '^9.0.0',
      '@mpxjs/eslint-config': '2.0.0'
    }
  }
  api.extendPackage(deps)
  api.render('./template', {
    needTs: !!options.needTs
  })
}
