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

const skipPluginId = [
  'built-in:config/base',
  'built-in:config/app',
  'built-in:config/css'
]

PluginAPI.prototype.chainWebpack = function (...args) {
  if (process.env.MPX_CURRENT_TARGET_MODE !== 'web' && skipPluginId.includes(this.id)) return
  originalChainWebpack.call(this, ...args)
}

PluginAPI.prototype.configureWebpack = function (...args) {
  if (process.env.MPX_CURRENT_TARGET_MODE !== 'web' && skipPluginId.includes(this.id)) return
  originalConfigureWebpack.call(this, ...args)
}

module.exports = Service
