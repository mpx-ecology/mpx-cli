const prefix = '@mpxjs/vue-cli-plugin-mpx'

const plugins = {
  tsSupport: {
    [`${prefix}-typescript`]: {
      version: '^1.0.0'
    }
  },
  cloudFunc: {
    [`${prefix}-cloud-func`]: {
      version: '^1.0.0'
    }
  },
  isPlugin: {
    [`${prefix}-plugin-mode`]: {
      version: '^1.0.0'
    }
  },
  transWeb: {
    [`${prefix}-web`]: {
      version: '^1.0.0'
    }
  }
  // TODO: 添加其他插件配置
}

module.exports = plugins
