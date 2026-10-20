module.exports = function (api, options) {
  const existing = api.generator.files['README.md']
  api.render('./template', {
    ...options,
    pkgName: (api.generator.pkg && api.generator.pkg.name) || 'mpx-project',
    needWeb: !!options.needWeb,
    rnProjectName: options.rnProjectName || 'ReactNativeProject',
    needRn: !!options.needRn
  })
  if (existing) {
    api.render((files) => {
      const generated = files['README.md'].trim()
      files['README.md'] = existing.includes(generated) ? existing : `${existing.trimEnd()}\n\n${generated}\n`
    })
  }
}
