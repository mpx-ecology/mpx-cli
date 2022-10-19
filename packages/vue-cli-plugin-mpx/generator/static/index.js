const MODE = require('../../constants/mode')

module.exports = function (api, options) {
  const srcMode = options.srcMode
  const newOptions = {
    ...options,
    cloudFunc: !!options.cloudFunc,
    isPlugin: !!options.isPlugin
  }
  api.render(`./${srcMode}`, newOptions)
  if (srcMode === 'wx' && !!options.cross) {
    MODE.SUPPORT_MODE.forEach(srcMode => {
      api.render(`./${srcMode}`, newOptions)
    })
  }
}
