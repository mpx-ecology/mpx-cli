module.exports = function (api, options) {
  api.render('./template', {
    ...options,
    cloudFunc: !!options.cloudFunc,
    isPlugin: !!options.isPlugin
  })
}
