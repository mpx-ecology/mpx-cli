const prefix = 'vue-cli-plugin-mpx'

const plugins = {
  needEslint: {
    [`${prefix}-eslint`]: {}
  },
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
    [`${prefix}-to-web`]: {}
  },
  needUnitTest: {
    [`${prefix}-unit-test`]: {}
  },
  needDll: {
    [`${prefix}-dll`]: {}
  }
  // TODO: 添加其他插件配置
}

module.exports = plugins
