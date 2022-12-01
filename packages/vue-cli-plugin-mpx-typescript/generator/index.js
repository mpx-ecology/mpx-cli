module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      typescript: '^4.1.3'
    }
  })

  if (!options.cloudFunc && !options.isPlugin) {
    api.render('./template-src', options)
  }
  api.render('./template-tsconfig')
}
