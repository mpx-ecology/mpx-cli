const prefix = '@mpxjs/vue-cli-plugin-mpx'

const plugins = {
  tsSupport: {
    [`${prefix}-typescript`]: {}
  },
  cloudFunc: {
    [`${prefix}-cloud-func`]: {}
  },
  isPlugin: {
    [`${prefix}-plugin-mode`]: {}
  },
  transWeb: {
    [`${prefix}-web`]: {}
  }
  // TODO: 添加其他插件配置
}

module.exports = plugins
