const { isPlugin, resolvePkg } = require('@vue/cli-shared-utils')

function isMpxCliPlugin(pkg) {
  return /mpx-/.test(pkg) && !/mpx-cube-ui/.test(pkg)
}

module.exports = function(api, options, webpackConfig, mode) {
  const pkg = resolvePkg(api.resolve(''))
  const mpxPlugins = Object.keys(pkg.devDependencies || {})
    .concat(Object.keys(pkg.dependencies || {}))
    .filter(isPlugin)
    .filter(isMpxCliPlugin)
  // TODO: 方便调试使用
  const mpxPluginsPath = mpxPlugins
    .map((name) => pkg.devDependencies[name] || pkg.dependencies[name] || '')
    .map((name) => name.replace(/file:/, ''))
    .filter((i) => !!i)

  tryApplyMpxCliPlugin(mpxPluginsPath)

  function tryApplyMpxCliPlugin(name) {
    let arr = []
    if (typeof name === 'string') {
      arr.push(name)
    } else if (Array.isArray(name)) {
      arr = name
    }
    arr.map((plugin) => {
      try {
        require(plugin)(api, options, webpackConfig, mode)
      } catch (e) {}
    })
  }
}
