module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      'ts-loader': '^9.0.0',
      typescript: '^4.1.3'
    }
  })

  if (!options.cloudFunc && !options.isPlugin) {
    api.render('./template-src', options)
  }
  api.render('./template-tsconfig')
}
