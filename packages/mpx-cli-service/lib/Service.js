const Service = require('@vue/cli-service')
const loadFileConfig = require('@vue/cli-service/lib/util/loadFileConfig')
const resolveUserConfig = require('@vue/cli-service/lib/util/resolveUserConfig')

const isPromise = p => p && typeof p.then === 'function'

Service.prototype.loadUserOptions = function () {
  const { fileConfig, fileConfigPath } = loadFileConfig(this.context)

  if (isPromise(fileConfig)) {
    return fileConfig
      .then(mod => mod.default)
      .then(loadedConfig => resolveUserConfig({
        inlineOptions: this.inlineOptions,
        pkgConfig: this.pkg.vue,
        fileConfig: loadedConfig,
        fileConfigPath
      }))
  }

  const fileConfigWrapper = () => {
    return typeof fileConfig === 'function' ? fileConfig(this.target) : fileConfig
  }

  return resolveUserConfig({
    inlineOptions: this.inlineOptions,
    pkgConfig: this.pkg.vue,
    fileConfig: fileConfigWrapper,
    fileConfigPath
  })
}

process.env.CI = 't'

module.exports = Service
