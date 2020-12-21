module.exports = function(api, options) {
  api.render('./template', {
    ...options,
    pkgName: (api.generator.pkg && api.generator.pkg.name) || 'mpx-project',
    cross: !!options.cross,
    transWeb: !!options.transWeb
  })
}
