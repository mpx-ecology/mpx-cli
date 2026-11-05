const MINI_PROGRAM_MODES = require('../../utils/miniProgramModes')

module.exports = function (api, options, invoking) {
  const srcMode = options.srcMode
  const newOptions = {
    ...options,
    cloudFunc: !!options.cloudFunc,
    isPlugin: !!options.isPlugin
  }
  if (!invoking) {
    const modes = srcMode === 'wx' && !options.cloudFunc && !options.isPlugin
      ? MINI_PROGRAM_MODES
      : [srcMode]
    modes.forEach(mode => {
      api.render(`./${mode}`, newOptions)
    })
  }
  if (options.needRn) {
    for (const mode of ['ios', 'android', 'harmony']) api.render(`./${mode}`, newOptions)
  }
}
