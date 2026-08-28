const prefix = '@mpxjs/vue-cli-plugin-mpx'
const { validateRnProjectName } = require('./createRn')

const prompts = [
  {
    name: 'srcMode',
    type: 'list',
    required: true,
    message: '请选择项目源码模式（仅微信模式支持跨平台输出）',
    choices: ['wx', 'ali', 'swan', 'qq', 'tt', 'dd'],
    default: 'wx'
  },
  {
    name: 'cross',
    when: ({ srcMode }) => srcMode === 'wx',
    message: '是否需要跨平台输出其他小程序和 Web',
    type: 'confirm',
    default: true
  },
  {
    name: 'needRn',
    when: ({ srcMode }) => srcMode === 'wx',
    message: '是否需要跨平台输出 React Native',
    type: 'confirm',
    default: false
  },
  {
    name: 'rnProjectName',
    when: ({ srcMode, needRn }) => srcMode === 'wx' && needRn === true,
    message: '请输入 React Native 项目名称',
    type: 'input',
    validate: validateRnProjectName
  },
  {
    name: 'needSSR',
    when: ({ srcMode, cross }) => srcMode === 'wx' && cross === true,
    message: '是否需要使用 Web SSR',
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
      '是否是小程序插件项目?（不清楚请选 No ！什么是插件项目请看微信官方文档！）',
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
    name: 'needEslint',
    type: 'confirm',
    message: '是否需要使用 Eslint',
    default: true,
    preset: {
      plugins: {
        [`${prefix}-eslint`]: {
          version: '^2.0.0'
        }
      }
    }
  },
  {
    name: 'needTs',
    type: 'confirm',
    message: '是否需要使用 Typescript',
    default: true,
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
    message: '是否需要使用原子 CSS',
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
    message: '是否需要使用单元测试',
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
    message: '是否需要使用 E2E 测试',
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

module.exports = function createPrompts (defaultRnProjectName) {
  return prompts.map((prompt) => prompt.name === 'rnProjectName'
    ? { ...prompt, default: defaultRnProjectName }
    : prompt)
}
