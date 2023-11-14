const prefix = '@mpxjs/vue-cli-plugin-mpx'

module.exports = [
  {
    name: 'srcMode',
    type: 'list',
    required: true,
    message: '请选择小程序项目所属平台（目前仅微信下支持跨平台输出）',
    choices: ['wx', 'ali', 'swan', 'qq', 'tt', 'dd'],
    default: 'wx'
  },
  {
    name: 'cross',
    when: ({ srcMode }) => srcMode === 'wx',
    message: '是否需要跨小程序平台',
    type: 'confirm',
    default: true
  },
  {
    name: 'needSSR',
    when: ({ srcMode }) => srcMode === 'wx',
    message: '是否需要 web ssr',
    type: 'confirm',
    default: false,
    preset: {
      plugins: {
        [`${prefix}-ssr`]: {
          version: '^2.0.0'
        }
      }
    }
  },
  {
    name: 'cloudFunc',
    when: ({ srcMode, cross }) => srcMode === 'wx' && cross === false,
    message: '是否需要使用小程序云开发能力',
    type: 'confirm',
    default: false,
    preset: {
      plugins: {
        [`${prefix}-cloud-func`]: {
          version: '^2.0.0'
        }
      }
    }
  },
  {
    name: 'isPlugin',
    when: ({ srcMode, cross, cloudFunc }) => srcMode === 'wx' && cross === false && cloudFunc === false,
    type: 'confirm',
    message:
      '是否是个插件项目?（不清楚请选 No ！什么是插件项目请看微信官方文档！）',
    default: false,
    preset: {
      plugins: {
        [`${prefix}-plugin-mode`]: {
          version: '^2.0.0'
        }
      }
    }
  },
  {
    name: 'needTs',
    type: 'confirm',
    message: '是否需要typescript',
    default: false,
    preset: {
      plugins: {
        [`${prefix}-typescript`]: {
          version: '^2.0.0'
        }
      }
    }
  },

  {
    name: 'needUtilityFirstCSS',
    type: 'confirm',
    message: '是否需要使用原子类',
    default: false,
    preset: {
      plugins: {
        [`${prefix}-utility-first-css`]: {
          version: '^2.0.0'
        }
      }
    }
  },
  {
    name: 'needUnitTest',
    message: '是否需要单元测试',
    type: 'confirm',
    default: false,
    preset: {
      plugins: {
        [`${prefix}-unit-test`]: {
          version: '^2.0.0'
        }
      }
    }
  },
  {
    name: 'needE2ETest',
    message: '是否需要自动化测试',
    type: 'confirm',
    default: false,
    preset: {
      plugins: {
        [`${prefix}-e2e-test`]: {
          version: '^2.0.0'
        }
      }
    }
  },
  {
    name: 'description',
    type: 'string',
    required: false,
    message: '项目描述',
    default: 'A mpx project'
  },
  {
    name: 'appid',
    when: ({ srcMode }) => srcMode === 'wx' || srcMode === 'dd',
    required: true,
    message: '请输入小程序的Appid',
    default: 'touristappid'
  }
]
