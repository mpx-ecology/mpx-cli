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
    name: 'transWeb',
    when: ({ srcMode, cross }) => srcMode === 'wx' && cross === true,
    message: '是否需要支持输出web',
    type: 'confirm',
    default: false
  },
  {
    name: 'cloudFunc',
    when: ({ srcMode, cross }) => srcMode === 'wx' && cross === false,
    message: '是否需要使用小程序云开发能力',
    type: 'confirm',
    default: false
  },
  {
    name: 'isPlugin',
    when: ({ srcMode, cross, cloudFunc }) => srcMode === 'wx' && cross === false && cloudFunc === false,
    type: 'confirm',
    message:
      '是否是个插件项目?（不清楚请选 No ！什么是插件项目请看微信官方文档！）',
    default: false
  },
  {
    name: 'needTs',
    type: 'confirm',
    message: '是否需要typescript',
    default: false
  },
  {
    name: 'needUnitTest',
    message: '是否需要单元测试',
    type: 'confirm',
    default: false
  },
  {
    name: 'needE2ETest',
    message: '是否需要自动化测试',
    type: 'confirm',
    default: false
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
    when: ({ srcMode }) => srcMode === 'wx',
    required: true,
    message: '请输入小程序的Appid',
    default: 'touristappid'
  }
]
