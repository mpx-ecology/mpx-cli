const path = require('path')

const pluginEntry = path.resolve(__dirname, '../index.js')
const configTemplate = path.resolve(__dirname, '../generator/template/uno.config.js')

beforeEach(() => {
  jest.resetModules()
})

test('uses the default export from the unocss plugin ESM namespace', () => {
  const MpxUnocssPlugin = jest.fn()
  const use = jest.fn()
  const plugin = jest.fn(() => ({ use }))

  jest.doMock('@mpxjs/unocss-plugin', () => Object.freeze({
    default: MpxUnocssPlugin
  }), { virtual: true })

  const applyPlugin = require(pluginEntry)
  applyPlugin({ chainWebpack: fn => fn({ plugin }) }, {})

  expect(plugin).toHaveBeenCalledWith('mpx-unocss-plugin')
  expect(use).toHaveBeenCalledWith(MpxUnocssPlugin, [undefined])
})

test('keeps using the unocss plugin CommonJS export', () => {
  const MpxUnocssPlugin = jest.fn()
  const use = jest.fn()
  const plugin = jest.fn(() => ({ use }))

  jest.doMock('@mpxjs/unocss-plugin', () => MpxUnocssPlugin, { virtual: true })

  const applyPlugin = require(pluginEntry)
  applyPlugin({ chainWebpack: fn => fn({ plugin }) }, {})

  expect(use).toHaveBeenCalledWith(MpxUnocssPlugin, [undefined])
})

test('uses the default export from the unocss base ESM namespace', () => {
  const preset = { name: 'preset-mpx' }
  const presetMpx = jest.fn(() => preset)
  const defineConfig = jest.fn(config => config)

  jest.doMock('unocss', () => ({ defineConfig }), { virtual: true })
  jest.doMock('@mpxjs/unocss-base', () => Object.freeze({
    default: presetMpx
  }), { virtual: true })

  const config = require(configTemplate)

  expect(defineConfig).toHaveBeenCalledTimes(1)
  expect(presetMpx).toHaveBeenCalledTimes(1)
  expect(config.presets).toEqual([preset])
})

test('keeps using the unocss base CommonJS export', () => {
  const preset = { name: 'preset-mpx' }
  const presetMpx = jest.fn(() => preset)

  jest.doMock('unocss', () => ({ defineConfig: config => config }), { virtual: true })
  jest.doMock('@mpxjs/unocss-base', () => presetMpx, { virtual: true })

  const config = require(configTemplate)

  expect(presetMpx).toHaveBeenCalledTimes(1)
  expect(config.presets).toEqual([preset])
})
