const Service = require('@vue/cli-service')
const PluginAPI = require('@vue/cli-service/lib/PluginAPI')

const t = require('@vue/cli-shared-utils')

process.env.CI = 't'

t.logWithSpinner = () => {}
t.stopSpinner = () => {}
t.pauseSpinner = () => {}
t.resumeSpinner = () => {}

const originalChainWebpack = PluginAPI.prototype.chainWebpack
const originalConfigureWebpack = PluginAPI.prototype.configureWebpack

const mpSkipPluginId = [
  'built-in:config/base',
  'built-in:config/app',
  'built-in:config/css'
]

PluginAPI.prototype.chainWebpack = function (fn) {
  originalChainWebpack.call(this, (...args) => {
    if (process.env.MPX_CURRENT_TARGET_MODE !== 'web' && mpSkipPluginId.includes(this.id)) return
    return fn.call(this, ...args)
  })
}

PluginAPI.prototype.configureWebpack = function (fn) {
  originalConfigureWebpack.call(this, (...args) => {
    if (process.env.MPX_CURRENT_TARGET_MODE !== 'web' && mpSkipPluginId.includes(this.id)) return
    return typeof fn === 'function' ? fn.call(this, ...args) : fn
  })
}

module.exports = Service
