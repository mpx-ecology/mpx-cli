module.exports = function (api, options) {
  api.render('.', {
    ...options,
    cloudFunc: !!options.cloudFunc,
    isPlugin: !!options.isPlugin
  })
}
