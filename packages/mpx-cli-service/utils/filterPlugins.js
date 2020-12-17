const { isPlugin, resolvePkg } = require('@vue/cli-shared-utils')

const isMpxPlugin = pkg => /mpx-/.test(pkg)

const PLATFORM_ALL = 'all'

module.exports = function filterPluginsByPlatform(platform) {
  const pkg = resolvePkg(process.cwd())
  const mpxPlugins = Object.keys(pkg.devDependencies || {})
    .concat(Object.keys(pkg.dependencies || {}))
    .filter(isPlugin)
    .filter(isMpxPlugin)

  return tryLoadMpxPlugin(mpxPlugins)

  function tryLoadMpxPlugin(name) {
    const res = []
    let arr = []
    if (typeof name === 'string') {
      arr.push(name)
    } else if (Array.isArray(name)) {
      arr = name
    }
    arr.map(plugin => {
      try {
        const { platform: _platform } = require(plugin)

        if (_platform && _platform !== PLATFORM_ALL && _platform !== platform) {
          res.push(plugin)
        }
      } catch (e) {}
    })

    return res
  }
}
