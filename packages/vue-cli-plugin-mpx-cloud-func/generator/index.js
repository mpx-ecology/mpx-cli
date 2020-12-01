module.exports = function(api, options) {
  api.render('./template', {
    isPlugin: !!options.isPlugin
  })
}
