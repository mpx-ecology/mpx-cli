const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const vm = require('vm')
const Generator = require('@vue/cli/lib/Generator')
const readFiles = require('@vue/cli/lib/util/readFiles')

function plugin (platform, options) {
  const main = platform === 'rn' || platform === 'web'
  return {
    id: '@mpxjs/vue-cli-plugin-mpx' + (main ? '' : `-${platform}`),
    apply: require(main ? '../generator' : `../../vue-cli-plugin-mpx-${platform}/generator`),
    options: { srcMode: 'wx', needRn: platform === 'rn', needWeb: platform === 'web' || platform === 'ssr', needSSR: platform === 'ssr', ...options }
  }
}

async function addPlugins (context, platforms, extractConfigFiles, options = { rnProjectName: 'CustomHost' }) {
  const generator = new Generator(context, {
    pkg: { name: 'test-project', scripts: {} },
    files: await readFiles(context),
    invoking: true,
    plugins: platforms.map(platform => plugin(platform, options))
  })
  await generator.generate({ extractConfigFiles, checkExisting: true })
  return generator
}

function evaluateConfig (source, mode, directory) {
  const configModule = { exports: {} }
  vm.runInNewContext(source, {
    module: configModule,
    require,
    process: { env: { MPX_CURRENT_TARGET_MODE: mode } },
    __dirname: directory
  })
  return configModule.exports
}

test.each([false, true])('only enables RN for wx sources with invoking=%s', async invoking => {
  for (const srcMode of ['wx', 'ali']) {
    const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-source-mode-'))
    try {
      const generator = new Generator(context, {
        pkg: { name: 'test-project', scripts: {} },
        invoking,
        plugins: [plugin('rn', { srcMode, name: 'test-project', appid: 'test', description: '' })]
      })
      await generator.generate({ extractConfigFiles: true })
      const enabled = srcMode === 'wx'
      const config = evaluateConfig(fs.readFileSync(path.join(context, 'mpx.config.js'), 'utf8'), srcMode, context)
      expect(!!config.pluginOptions.mpx.plugin.rnConfig).toBe(enabled)
      expect(!!generator.pkg.devDependencies['@babel/preset-react']).toBe(enabled)
      for (const mode of ['ios', 'android']) {
        expect(!!generator.pkg.scripts[`serve:${mode}`]).toBe(enabled)
        expect(!!generator.pkg.scripts[`build:${mode}`]).toBe(enabled)
        expect(fs.existsSync(path.join(context, 'static', mode))).toBe(enabled)
      }
      expect(fs.readFileSync(path.join(context, 'AGENTS.md'), 'utf8').includes('## RN iOS')).toBe(enabled)
    } finally {
      fs.removeSync(context)
    }
  }
})

test.each([
  ['rn', { mpx: { plugin: { rnConfig: { projectName: 'CustomHost' } } } }],
  ['ssr', { SSR: { devClientPort: 8000 } }],
  ['utility-first-css', { mpx: { unocss: {} } }],
  ['web', {}]
])('adding %s preserves the existing Mpx config', async (platform, expected) => {
  const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-generator-'))
  const configPath = path.join(context, 'mpx.config.js')
  const source = "module.exports = { outputDir: 'custom-dist', pluginOptions: { mpx: { plugin: { srcMode: 'wx' } } } }\n"
  try {
    fs.writeFileSync(configPath, source)
    const appSource = '<script>/* existing application */</script>\n'
    fs.outputFileSync(path.join(context, 'src/app.mpx'), appSource)
    const generator = new Generator(context, {
      pkg: { name: 'test-project', scripts: {} },
      files: await readFiles(context),
      invoking: true,
      plugins: [plugin(platform, { rnProjectName: 'CustomHost' })]
    })
    await generator.generate({ extractConfigFiles: true, checkExisting: true })

    // 直接执行生成内容，避免配置转换期间的 require 缓存影响验证。
    const configModule = { exports: {} }
    vm.runInNewContext(fs.readFileSync(configPath, 'utf8'), { module: configModule })
    expect(configModule.exports.outputDir).toBe('custom-dist')
    expect(configModule.exports.pluginOptions.mpx.plugin.srcMode).toBe('wx')
    expect(configModule.exports.pluginOptions).toMatchObject(expected)
    expect(fs.existsSync(path.join(context, 'vue.config.js'))).toBe(false)
    expect(generator.pkg).not.toHaveProperty('mpx')
    expect(fs.readFileSync(path.join(context, 'src/app.mpx'), 'utf8')).toBe(appSource)
    if (platform === 'web') {
      expect(fs.readFileSync(configPath, 'utf8')).toBe(source)
      expect(fs.existsSync(path.join(context, 'public/index.html'))).toBe(true)
      expect(generator.pkg.scripts['serve:web']).toBe('mpx-cli-service serve --targets=web')
    }
  } finally {
    fs.removeSync(context)
  }
})

describe.each([false, true])('new app entry with reversed feature plugin order=%s', reverse => {
  test.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true]
  ])('preserves TS=%s and SSR=%s in the shared template', async (needTs, needSSR) => {
    const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-app-template-'))
    try {
      const features = []
      if (needTs) features.push('-typescript')
      if (needSSR) features.push('-ssr')
      if (reverse) features.reverse()
      const options = { name: 'test-project', srcMode: 'wx', appid: 'test', description: '', needWeb: true, needTs, needSSR }
      const generator = new Generator(context, {
        pkg: { name: 'test-project', scripts: {}, devDependencies: {} },
        plugins: ['', ...features].map(suffix => ({
          id: `@mpxjs/vue-cli-plugin-mpx${suffix}`,
          apply: require(`../../vue-cli-plugin-mpx${suffix}/generator`),
          options: { ...options }
        }))
      })
      await generator.generate({ extractConfigFiles: true })
      const app = fs.readFileSync(path.join(context, 'src/app.mpx'), 'utf8')
      expect(app).not.toMatch(/<%|%>/)
      expect(app.startsWith('<script lang="ts">')).toBe(needTs)
      expect(app.includes('onSSRAppCreated')).toBe(needSSR)
      expect(app.includes('onAppInit')).toBe(needSSR)
      expect(app.includes("mode: 'history'")).toBe(needSSR)
      expect(app).toContain('"./pages/index"')
      const script = app.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
      expect(() => require('@babel/parser').parse(script, {
        sourceType: 'module',
        plugins: needTs ? ['typescript'] : []
      })).not.toThrow()
      for (const file of ['pages/index.mpx', 'components/list.mpx']) {
        const content = fs.readFileSync(path.join(context, 'src', file), 'utf8')
        expect(content.includes('<script lang="ts">')).toBe(needTs)
      }
    } finally {
      fs.removeSync(context)
    }
  })
})

describe.each([true, false])('with extractConfigFiles=%s', extractConfigFiles => {
  let context
  let configPath

  beforeEach(() => {
    context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-dynamic-config-'))
    configPath = path.join(context, 'mpx.config.js')
  })

  afterEach(() => {
    fs.removeSync(context)
    delete global.__mpxConfigReadCount
  })

  test.each([{}, { rnProjectName: 'ReplacementHost' }])('uses the preserved RN host for scripts and docs with options %j', async options => {
    const source = `globalThis.__mpxConfigReadCount = (globalThis.__mpxConfigReadCount || 0) + 1
const defineConfig = value => value
const config = { pluginOptions: { mpx: { plugin: { rnConfig: { projectName: 'ExistingHost' } } } } }
module.exports = defineConfig(config)
`
    fs.writeFileSync(configPath, source)
    const generator = await addPlugins(context, ['rn'], extractConfigFiles, options)
    expect(global.__mpxConfigReadCount).toBeUndefined()
    expect(fs.readFileSync(configPath, 'utf8')).toBe(source)
    for (const mode of ['ios', 'android']) {
      expect(generator.pkg.scripts[`serve:${mode}`]).toBe(`cd ExistingHost && npm run ${mode} && cd .. && mpx-cli-service serve --targets=${mode}`)
      expect(generator.pkg.scripts[`build:${mode}`]).toBe(`mpx-cli-service build --targets=${mode} && cd ExistingHost && npm run bundle:${mode}`)
    }
    for (const name of ['README.md', 'AGENTS.md']) {
      const content = fs.readFileSync(path.join(context, name), 'utf8')
      expect(content).toContain('ExistingHost')
      expect(content).not.toMatch(/ReactNativeProject|ReplacementHost/)
    }
  })

  test('does not guess or execute a dynamic RN host name', async () => {
    const source = 'module.exports = { pluginOptions: { mpx: { plugin: { rnConfig: { projectName: resolveHost() } } } } }\n'
    fs.writeFileSync(configPath, source)
    await expect(addPlugins(context, ['rn'], extractConfigFiles, {}))
      .rejects.toThrow('module.exports.pluginOptions.mpx.plugin.rnConfig.projectName')
    expect(fs.readFileSync(configPath, 'utf8')).toBe(source)
    expect(fs.readdirSync(context)).toEqual(['mpx.config.js'])
  })

  test.each(['rn', 'ssr', 'utility-first-css'])('adding %s preserves expressions without executing the config', async platform => {
    const source = `const path = require('path')
globalThis.__mpxConfigReadCount = (globalThis.__mpxConfigReadCount || 0) + 1
const sourceDir = () => path.resolve(__dirname, 'src')
module.exports = {
  outputDir: 'dist/' + process.env.MPX_CURRENT_TARGET_MODE,
  pluginOptions: {
    mpx: {
      plugin: {
        // 按构建目标计算，不能固化为生成时的值。
        defs: { TARGET: process.env.MPX_CURRENT_TARGET_MODE },
        transRpxRules: [{ include: sourceDir(), mode: 'only' }],
        resolveSource: () => sourceDir()
      }
    },
    SSR: { devClientPort: Number(process.env.MPX_CURRENT_TARGET_MODE === 'web' ? 9000 : 9001) }
  }
}
`
    fs.writeFileSync(configPath, source)
    const generator = await addPlugins(context, [platform], extractConfigFiles)
    expect(global.__mpxConfigReadCount).toBeUndefined()
    expect(generator.pkg).not.toHaveProperty('mpx')
    expect(fs.existsSync(path.join(context, 'vue.config.js'))).toBe(false)
    const generated = fs.readFileSync(configPath, 'utf8')
    expect(generated).toContain('// 按构建目标计算，不能固化为生成时的值。')
    for (const mode of ['wx', 'web']) {
      const directory = path.join(context, mode)
      const config = evaluateConfig(generated, mode, directory)
      expect(config.outputDir).toBe(`dist/${mode}`)
      expect(config.pluginOptions.mpx.plugin.defs.TARGET).toBe(mode)
      expect(config.pluginOptions.mpx.plugin.transRpxRules[0].include).toBe(path.join(directory, 'src'))
      expect(config.pluginOptions.mpx.plugin.resolveSource()).toBe(path.join(directory, 'src'))
      expect(config.pluginOptions.SSR.devClientPort).toBe(mode === 'web' ? 9000 : 9001)
      if (platform === 'rn') expect(config.pluginOptions.mpx.plugin.rnConfig.projectName).toBe('CustomHost')
      if (platform === 'utility-first-css') expect(config.pluginOptions.mpx.unocss).toEqual({})
    }
    await addPlugins(context, [platform], extractConfigFiles)
    expect(fs.readFileSync(configPath, 'utf8')).toBe(generated)
    expect(global.__mpxConfigReadCount).toBeUndefined()
  })

  test('collects multiple plugins when creating a new config', async () => {
    const generator = await addPlugins(context, ['rn', 'ssr', 'utility-first-css'], extractConfigFiles)
    const config = evaluateConfig(fs.readFileSync(configPath, 'utf8'), 'wx', context)
    expect(config.pluginOptions).toMatchObject({
      mpx: { plugin: { rnConfig: { projectName: 'CustomHost' } }, unocss: {} },
      SSR: { devClientPort: 8000 }
    })
    expect(generator.pkg).not.toHaveProperty('mpx')
  })

  test.each([
    'module.exports = config',
    'module.exports = defineConfig(config)',
    "module.exports = defineConfig({ pluginOptions: { 'mpx': { plugin: { srcMode: 'wx' } } } })"
  ])('supports %s', async exportStatement => {
    fs.writeFileSync(configPath, `const defineConfig = value => value
const config = { pluginOptions: { 'mpx': { plugin: { srcMode: 'wx' } } } }
${exportStatement}
`)
    await addPlugins(context, ['rn'], extractConfigFiles)
    const config = evaluateConfig(fs.readFileSync(configPath, 'utf8'), 'wx', context)
    expect(config.pluginOptions.mpx.plugin).toMatchObject({ srcMode: 'wx', rnConfig: { projectName: 'CustomHost' } })
  })

  test.each([
    ['module.exports = createConfig()', 'module.exports'],
    ['module.exports = { pluginOptions: createOptions() }', 'module.exports.pluginOptions'],
    ['module.exports = { pluginOptions: { ...options } }', 'module.exports.pluginOptions'],
    ['module.exports = { pluginOptions: { [key]: {} } }', 'module.exports.pluginOptions']
  ])('keeps the file intact when it cannot safely merge %s', async (source, location) => {
    fs.writeFileSync(configPath, source)
    await expect(addPlugins(context, ['ssr'], extractConfigFiles)).rejects.toThrow(`无法安全合并 mpx.config.js 的 ${location}`)
    expect(fs.readFileSync(configPath, 'utf8')).toBe(source)
    expect(fs.readdirSync(context)).toEqual(['mpx.config.js'])
  })
})

test.each(['babel.config.json', 'babel.config.js'])('adding RN preserves %s and prompts for manual configuration across repeated invocation', async configFile => {
  const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-existing-'))
  try {
    fs.outputFileSync(path.join(context, 'src/pages/custom.mpx'), 'user source')
    fs.writeFileSync(path.join(context, 'README.md'), '# User notes\n')
    const config = JSON.stringify({
      presets: [['@babel/preset-env', { modules: false }], ['@babel/preset-react', { runtime: 'classic' }]],
      plugins: [['react-native-reanimated/plugin', { relativeSourceLocation: true }], 'custom-plugin', 'react-native-reanimated/plugin'],
      env: { test: { plugins: ['test-plugin'] } }
    }, null, 2)
    const original = '// User Babel configuration\n' + (configFile.endsWith('.js') ? `module.exports = ${config}\n` : `${config}\n`)
    fs.writeFileSync(path.join(context, configFile), original)
    const generator = await addPlugins(context, ['rn'], true)
    expect(fs.readFileSync(path.join(context, configFile), 'utf8')).toBe(original)
    expect(generator.exitLogs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'warn',
        msg: expect.stringContaining('["@babel/preset-react", { "runtime": "automatic" }]')
      }),
      expect.objectContaining({
        type: 'warn',
        msg: expect.stringContaining('"react-native-reanimated/plugin" 放在 plugins 的最后一项')
      })
    ]))
    const readme = fs.readFileSync(path.join(context, 'README.md'), 'utf8')
    expect(readme).toContain('# User notes')
    await addPlugins(context, ['rn'], true)
    expect(fs.readFileSync(path.join(context, configFile), 'utf8')).toBe(original)
    expect(fs.readFileSync(path.join(context, 'README.md'), 'utf8')).toBe(readme)
    expect(fs.readFileSync(path.join(context, 'src/pages/custom.mpx'), 'utf8')).toBe('user source')
  } finally {
    fs.removeSync(context)
  }
})

test.each([
  [undefined, undefined],
  [true, undefined],
  [undefined, true],
  [false, false],
  [false, true],
  [true, false]
])('rejects SSR invocation with needWeb=%s and needSSR=%s before writing files', async (needWeb, needSSR) => {
  const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-no-web-'))
  try {
    await expect(addPlugins(context, ['web', 'ssr'], true, { needWeb, needSSR }))
      .rejects.toThrow('SSR 插件需要同时启用 needWeb 和 needSSR')
    expect(fs.readdirSync(context)).toEqual([])
  } finally {
    fs.removeSync(context)
  }
})

test.each([false, true])('RN scripts and TS exclusions use the existing host with reversed order=%s', async reverse => {
  const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-ts-host-'))
  try {
    fs.writeFileSync(path.join(context, 'mpx.config.js'), "module.exports = { pluginOptions: { mpx: { plugin: { rnConfig: { projectName: 'ExistingHost' } } } } }\n")
    const plugins = ['rn', 'typescript']
    if (reverse) plugins.reverse()
    const generator = await addPlugins(context, plugins, true, { needRn: true, needTs: true, rnProjectName: 'ReplacementHost' })
    const tsconfig = require('json5').parse(fs.readFileSync(path.join(context, 'tsconfig.json'), 'utf8'))
    expect(tsconfig.exclude).toContain('ExistingHost')
    expect(tsconfig.exclude).not.toContain('ReplacementHost')
    expect(generator.pkg.scripts['serve:ios']).toContain('cd ExistingHost')
    expect(generator.pkg.scripts['build:android']).toContain('cd ExistingHost')
  } finally {
    fs.removeSync(context)
  }
})

test.each(['eslint', 'unit-test', 'e2e-test'])('%s supplies its own documentation without duplicating user content', async platform => {
  const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-plugin-docs-'))
  try {
    fs.writeFileSync(path.join(context, 'README.md'), '# User readme\n')
    fs.writeFileSync(path.join(context, 'AGENTS.md'), '# User instructions\n\n## 校验与交付\n')
    await addPlugins(context, [platform], true)
    const command = { eslint: 'npm run lint', 'unit-test': 'npm test', 'e2e-test': 'npm run build:e2e' }[platform]
    const original = {}
    for (const name of ['README.md', 'AGENTS.md']) {
      original[name] = fs.readFileSync(path.join(context, name), 'utf8')
      expect(original[name]).toContain('# User')
      expect(original[name].split(command)).toHaveLength(2)
    }
    await addPlugins(context, [platform], true)
    for (const name of Object.keys(original)) {
      expect(fs.readFileSync(path.join(context, name), 'utf8')).toBe(original[name])
    }
  } finally {
    fs.removeSync(context)
  }
})

test('renders each mini-program static template once', () => {
  const api = { render: jest.fn() }
  require('../generator/static')(api, { srcMode: 'wx', needRn: true }, false)
  const paths = api.render.mock.calls.map(([source]) => source)
  expect(paths.filter(source => source === './wx')).toHaveLength(1)
  expect(new Set(paths).size).toBe(paths.length)
  expect(paths).toEqual(expect.arrayContaining(['./ali', './ios', './android', './harmony']))
})
