const prefix = '@mpxjs/vue-cli-plugin-mpx'

// prompt值和插件对应结构
const plugins = {
  needTs: {
    [`${prefix}-typescript`]: {
      version: '^1.0.0'
    }
  },
  needUnitTest: {
    [`${prefix}-unit-test`]: {
      version: '^1.0.0'
    }
  },
  needE2ETest: {
    [`${prefix}-e2e-test`]: {
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
  }
  // TODO: 添加其他插件配置
}

module.exports = plugins
