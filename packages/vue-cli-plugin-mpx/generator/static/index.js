const supportedModes = require('../../config/supportedModes')

module.exports = function (api, options) {
  const srcMode = options.srcMode
  const newOptions = {
    ...options,
    cloudFunc: !!options.cloudFunc,
    isPlugin: !!options.isPlugin
  }
  api.render(`./${srcMode}`, newOptions)
  if (srcMode === 'wx' && !!options.cross) {
    supportedModes.forEach(srcMode => {
      api.render(`./${srcMode}`, newOptions)
    })
  }
}
