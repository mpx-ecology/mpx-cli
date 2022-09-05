module.exports = function (api, options = {}) {
  api.extendPackage({
    scripts: {
      lint: 'eslint --ext .js,.ts,.mpx src/'
    },
    devDependencies: {
      'eslint-webpack-plugin': '^3.1.1',
      eslint: '^7.0.0',
      '@mpxjs/eslint-config': '^1.0.3'
    }
  })
  api.render('./template')
}
