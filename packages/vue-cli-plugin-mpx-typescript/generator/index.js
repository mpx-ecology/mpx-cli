module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      'ts-loader': '^9.0.0',
      typescript: '^4.1.3',
      '@typescript-eslint/eslint-plugin': '^2.27.0',
      '@typescript-eslint/parser': '^2.27.0'
    }
  })

  if (!options.cloudFunc && !options.isPlugin) {
    api.render('./template-src', options)
  }
  api.render('./template-tsconfig')
}
