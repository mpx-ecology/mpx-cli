module.exports = function (api, options = {}) {
  const deps = {
    scripts: {
      lint: 'eslint --ext .js,.ts,.mpx src/'
    },
    devDependencies: {
      'eslint-webpack-plugin': '^3.1.1',
      eslint: '^7.0.0'
    }
  }
  if (options.needTs) {
    deps.devDependencies['@mpxjs/eslint-config'] = '^1.0.5'
  } else {
    deps.devDependencies['@mpxjs/eslint-config-ts'] = '^1.0.5'
  }
  api.extendPackage(deps)
  api.render('./template', {
    needTs: !!options.needTs
  })
}
