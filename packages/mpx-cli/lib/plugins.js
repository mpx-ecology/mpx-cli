const prefix = '@mpxjs/vue-cli-plugin-mpx'

const plugins = {
  tsSupport: {
    [`${prefix}-typescript`]: {
      version: '^1.1.0-beta.1'
    }
  },
  cloudFunc: {
    [`${prefix}-cloud-func`]: {
      version: '^1.1.0-beta.1'
    }
  },
  isPlugin: {
    [`${prefix}-plugin-mode`]: {
      version: '^1.1.0-beta.1'
    }
  },
  transWeb: {
    [`${prefix}-web`]: {
      version: '^1.1.0-beta.1'
    }
  }
  // TODO: 添加其他插件配置
}

module.exports = plugins
