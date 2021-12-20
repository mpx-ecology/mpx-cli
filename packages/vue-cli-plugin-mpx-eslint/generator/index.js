module.exports = function (api, options = {}) {
  api.extendPackage({
    devDependencies: {
      'eslint-webpack-plugin': '^3.1.1',
      eslint: '^7.0.0',
      'eslint-config-babel': '^8.0.2',
      'eslint-config-standard': '^12.0.0',
      'eslint-friendly-formatter': '^4.0.1',
      'eslint-plugin-html': '^6.0.1',
      'eslint-plugin-import': '^2.14.0',
      'eslint-plugin-local-rules': '^0.1.0',
      'eslint-plugin-node': '^8.0.0',
      'eslint-plugin-prettier': '^2.6.2',
      'eslint-plugin-promise': '^4.0.1',
      'eslint-plugin-standard': '^4.0.0'
    }
  })
}
