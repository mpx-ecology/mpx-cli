const mockServe = jest.fn()
const mockDone = jest.fn((error, stats) => error || stats.hasErrors()
  ? Promise.reject(error || new Error('Build failed'))
  : Promise.resolve(stats))

jest.mock('@mpxjs/vue-cli-plugin-mpx/commands/serve/web', () => ({
  serveWeb: (...args) => mockServe('client', ...args)
}))
jest.mock('../commands/serve/serveServer', () => ({
  serveServer: (...args) => mockServe('server', ...args)
}))
jest.mock('@mpxjs/vue-cli-plugin-mpx/utils/webpack', () => ({
  handleWebpackDone: (...args) => mockDone(...args)
}))

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const Config = require('webpack-chain')
const { merge } = require('webpack-merge')
const { resolveServeWebpackConfigByTarget } = require('@mpxjs/vue-cli-plugin-mpx/config')
const { registerBuildCommand } = require('../commands/build')
const { registerServeCommand } = require('../commands/serve')

let context
let api
let options
let configs
let commands
let originalEnv
let chainFns
let rawFns

beforeEach(() => {
  originalEnv = { ...process.env }
  process.env.MPX_CURRENT_TARGET_MODE = 'web'
  context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-ssr-config-'))
  fs.writeFileSync(path.join(context, 'entry.js'), 'export default function app () { return "ssr" }\n')
  options = { outputDir: path.join(context, 'dist'), publicPath: '/original/', pluginOptions: { SSR: { devClientPort: 9010 } } }
  configs = []
  commands = {}
  chainFns = [config => {
    config.mode('development')
    config.entry('app').add(path.join(context, 'entry.js'))
    config.output.path(options.outputDir).filename('app.js').publicPath(options.publicPath)
    config.cache({ type: 'filesystem', cacheDirectory: path.join(context, '.cache') })
  }]
  rawFns = [() => ({ output: { chunkFilename: 'custom-[id].js' } })]
  api = {
    service: { context, webpackChainFns: chainFns, webpackRawConfigFns: rawFns },
    resolve: file => path.resolve(context, file),
    registerCommand: (name, meta, run) => { commands[name] = run },
    chainWebpack: fn => api.service.webpackChainFns.push(fn),
    configureWebpack: fn => api.service.webpackRawConfigFns.push(fn),
    resolveChainableWebpackConfig: () => {
      const config = new Config()
      for (const fn of api.service.webpackChainFns) fn(config)
      return config
    },
    resolveWebpackConfig: async chain => {
      chain = chain || api.resolveChainableWebpackConfig()
      await Promise.all(api.service.webpackChainPromises || [])
      let config = chain.toConfig()
      for (const fn of api.service.webpackRawConfigFns) config = merge(config, fn(config) || {})
      configs.push(config)
      return config
    }
  }
  mockServe.mockImplementation(async (mode, api, options, args) => {
    await resolveServeWebpackConfigByTarget(api, options, { mode: 'web' }, args)
  })
  registerBuildCommand(api, options)
  registerServeCommand(api, options)
})

afterEach(() => {
  process.env = originalEnv
  fs.removeSync(context)
  jest.clearAllMocks()
})

function expectRestored () {
  expect(api.service.webpackChainFns).toBe(chainFns)
  expect(api.service.webpackRawConfigFns).toBe(rawFns)
  expect(chainFns).toHaveLength(1)
  expect(rawFns).toHaveLength(1)
  expect(api.service.webpackChainPromises).toBeUndefined()
  expect(options.publicPath).toBe('/original/')
}

function expectIsolated (config, mode) {
  const names = config.plugins.map(plugin => plugin.constructor.name)
  expect(names).toContain(mode === 'client' ? 'VueSSRClientPlugin' : 'VueSSRServerPlugin')
  expect(names).not.toContain(mode === 'client' ? 'VueSSRServerPlugin' : 'VueSSRClientPlugin')
  expect(config.target).toBe(mode === 'client' ? 'web' : 'node')
  expect(config.output.chunkFilename).toBe('custom-[id].js')
}

test('builds separate client/server artifacts and restores state across repeated builds', async () => {
  for (let attempt = 0; attempt < 2; attempt++) {
    const stats = await commands['build:ssr']({ clean: false })
    expect(stats.every(result => !result.hasErrors())).toBe(true)
    expectIsolated(configs[attempt * 2], 'client')
    expectIsolated(configs[attempt * 2 + 1], 'server')
    expectRestored()
  }
  expect(fs.readJsonSync(path.join(options.outputDir, 'vue-ssr-client-manifest.json')).initial).toContain('app.js')
  expect(fs.readJsonSync(path.join(options.outputDir, 'vue-ssr-server-bundle.json')).entry).toBe('app.js')
  for (const call of mockDone.mock.calls) expect(call[2]).toBe(false)
})

test('restores state and rejects a failed compilation without starting the other compiler', async () => {
  fs.writeFileSync(path.join(context, 'entry.js'), 'invalid javascript !!!')
  await expect(commands['build:ssr']({ clean: false })).rejects.toThrow('Build failed')
  expect(configs).toHaveLength(1)
  expectRestored()
})

test('isolates development configurations, ports and public paths across repeated starts', async () => {
  for (let attempt = 0; attempt < 2; attempt++) {
    await commands['serve:ssr']({})
    const [client, server] = configs.slice(attempt * 2, attempt * 2 + 2)
    expectIsolated(client, 'client')
    expectIsolated(server, 'server')
    expect(client.output.publicPath).toBe('http://localhost:9010/')
    expect(server.output.publicPath).toBe('/')
    expect(client.devServer.port).toBe(9010)
    expectRestored()
  }
})

test('restores state when development startup rejects', async () => {
  mockServe.mockRejectedValueOnce(new Error('startup failed'))
  await expect(commands['serve:ssr']({})).rejects.toThrow('startup failed')
  expect(mockServe).toHaveBeenCalledTimes(1)
  expectRestored()
})
