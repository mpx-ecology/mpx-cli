module.exports = function (api, options) {
  const srcMode = options.srcMode
  if (srcMode === 'wx') {
    api.render('./wx', {
      ...options,
      cloudFunc: !!options.cloudFunc,
      isPlugin: !!options.isPlugin
    })
  }
  if (srcMode === 'ali' || (srcMode === 'wx' && !!options.cross)) {
    api.render('./ali', options)
  }
}
