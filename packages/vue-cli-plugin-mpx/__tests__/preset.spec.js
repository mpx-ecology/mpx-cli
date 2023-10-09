jest.mock('inquirer')

const path = require('path')
const fs = require('fs')
const create = require('@mpxjs/cli/lib/create')

// intersection
// 引入本脚手架的utils/index.js里面的intersection方法，用来比较两个数组的交集，测试一下这个方法
const { intersection } = require('../utils/index.js')
test('intersection', () => {
  expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
})

// removeArgv
// 引入本脚手架的utils/index.js里面的removeArgv方法，用来移除argv里面的某个参数，测试一下这个方法
const { removeArgv } = require('../utils/index.js')
test('removeArgv', () => {
  expect(removeArgv(['--name'], '--name')).toEqual([])
})

// makeMap
// 引入本脚手架的utils/index.js里面的makeMap方法
// makeMap函数的作用是将给定的数组转换为一个键值对形式的对象（Map），其中数组的元素作为对象的键，值为true。它适用于需要快速判断某个元素是否在给定数组中的情况。
const { makeMap } = require('../utils/index.js')
test('makeMap', () => {
  // 测试空数组的情况
  expect(makeMap([])).toEqual({})

  // 测试只有一个元素的数组的情况
  expect(makeMap(['a'])).toEqual({ a: true })

  // 测试多个元素的数组的情况
  expect(makeMap(['a', 'b', 'c'])).toEqual({ a: true, b: true, c: true })

  // 测试数组中包含重复元素的情况
  expect(makeMap(['a', 'b', 'a'])).toEqual({ a: true, b: true })
})

// getMpxPluginOptions
const { getMpxPluginOptions } = require('../utils/index.js')
test('getMpxPluginOptions', () => {
  // 测试没有传入参数的情况
  expect(getMpxPluginOptions()).toEqual({})

  // 测试传入参数为空对象的情况
  expect(getMpxPluginOptions({})).toEqual({})

  // 测试传入参数包含pluginOptions字段但没有mpx字段的情况
  expect(getMpxPluginOptions({ pluginOptions: {} })).toEqual({})

  // 测试传入参数包含pluginOptions和mpx字段的情况
  expect(getMpxPluginOptions({ pluginOptions: { mpx: { mode: 'wx' } } })).toEqual({ mode: 'wx' })
})

// getTargets
const { getTargets } = require('../utils/index.js')
test('getTargets', () => {
  // 测试没有传入 targets 和 options 参数的情况
  // 预期结果：返回包含默认目标的数组 [{ mode: 'wx' }]
  expect(getTargets({}, {})).toEqual([{ mode: 'wx' }])

  // 测试传入 targets 参数为字符串的情况
  // 预期结果：返回包含根据 targets 解析得到的目标的数组
  expect(getTargets({ targets: 'wx,ali' }, {})).toEqual([{ mode: 'wx' }, { mode: 'ali' }])

  // 测试传入 targets 参数为逗号分隔的字符串的情况
  // 预期结果：返回包含根据 targets 解析得到的目标的数组
  expect(getTargets({ targets: 'wx,ali,swan' }, {})).toEqual([
    { mode: 'wx' },
    { mode: 'ali' },
    { mode: 'swan' }
  ])

  // 测试传入 targets 参数为其他非空值的情况
  // 预期结果：返回默认目标 [{ mode: 'wx' }]
  expect(getTargets({ targets: 'xyz' }, {})).toEqual([{ mode: 'wx' }])

  // 测试传入 options 参数包含 mpx 字段的情况
  // 预期结果：返回根据 options.mpx.srcMode 解析的目标数组
  expect(getTargets({}, { pluginOptions: { mpx: { srcMode: 'ali' } } })).toEqual([{ mode: 'ali' }])
})

// getCurrentTarget
const { getCurrentTarget } = require('../utils/index.js')
test('getCurrentTarget', () => {
  // 测试默认情况下获取当前目标对象
  // 预期结果：返回包含 mode 和 env 字段的当前目标对象
  expect(getCurrentTarget()).toEqual({
    mode: process.env.MPX_CURRENT_TARGET_MODE,
    env: process.env.MPX_CURRENT_TARGET_ENV
  })
})

// parseTarget
const { parseTarget } = require('../utils/index.js')
test('parseTarget', () => {
  // 测试没有传入 target 和 options 参数的情况
  // 预期结果：返回包含默认目标的对象 { mode: 'wx', env: undefined }
  expect(parseTarget()).toEqual({ mode: 'wx', env: undefined })

  // 测试传入不包含环境的目标字符串的情况
  // 预期结果：返回包含根据 target 解析得到的目标对象 { mode: 'wx', env: undefined }
  expect(parseTarget('wx')).toEqual({ mode: 'wx', env: undefined })

  // 测试传入包含环境的目标字符串的情况
  // 预期结果：返回包含根据 target 解析得到的目标对象 { mode: 'wx', env: 'dev' }
  expect(parseTarget('wx:dev')).toEqual({ mode: 'wx', env: 'dev' })

  // 测试没有传入模式的情况，且根据 options 获取默认模式的情况
  // 预期结果：返回包含默认模式和环境的目标对象 { mode: 'ali', env: undefined }
  expect(parseTarget('', { pluginOptions: { mpx: { srcMode: 'ali' } } })).toEqual({ mode: 'ali', env: undefined })
})

// runServiceCommand
const { runServiceCommand } = require('../utils/index.js')
const execa = require('execa')
jest.mock('execa')
test('runServiceCommand', () => {
  // 测试执行命令并传入命令行参数的情况
  // 预期结果：返回 Promise 对象，执行命令并将命令行参数传递给该命令
  execa.node.mockResolvedValue()
  expect(runServiceCommand('build', ['--watch'], { cwd: '/path/to/project' })).resolves.toBeUndefined()

  // 测试执行命令不传入命令行参数的情况
  // 预期结果：返回 Promise 对象，仅执行命令而不传递命令行参数
  execa.node.mockResolvedValue()
  expect(runServiceCommand('lint', [], { cwd: '/path/to/project' })).resolves.toBeUndefined()
})
