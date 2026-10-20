jest.mock('inquirer')

const path = require('path')
const fs = require('fs')
const create = require('@mpxjs/cli/lib/create')

test('normal', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-normal'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx')
})

test('normal-didi', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-normal-didi'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'dd',
      description: 'test',
      appid: 'dd-test',
      needWeb: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx')
})

test('ignores RN in a non-wx preset before validating the host name', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-ali-with-rn'
  const preset = {
    srcMode: 'ali',
    needRn: true,
    needTs: true,
    rnProjectName: 'invalid-host-name',
    description: 'test',
    plugins: {},
    useConfigFiles: true
  }
  await create(name, { cwd, force: true, git: false }, preset)

  const project = path.join(cwd, name)
  const pkg = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'))
  expect(preset.needRn).toBe(false)
  expect(pkg.scripts).not.toHaveProperty('serve:ios')
  expect(pkg.scripts).not.toHaveProperty('build:android')
  expect(fs.readFileSync(path.join(project, 'tsconfig.json'), 'utf8')).not.toContain('invalid-host-name')
  expect(fs.existsSync(path.join(project, 'static/ios'))).toBe(false)
})

/**
 * 未启用 Web 时仍生成其他小程序静态配置
 */
test('normal-without-web', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'normal-without-web'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: false,
      plugins: {},
      useConfigFiles: true
    }
  )

  const staticAliDir = fs.existsSync(path.resolve(cwd, name, 'static/ali'))
  expect(staticAliDir).toBe(true)
})

test('test-eslint', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-normal-eslint'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      plugins: {},
      useConfigFiles: true,
      needEslint: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-eslint')
})

test('test-ts', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-ts'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      needTs: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-typescript')
})

test('test-cloud-func', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-cloud-func'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      cloudFunc: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-cloud-func')
})

test('test-cloud-func', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-cloud-func'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      cloudFunc: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-cloud-func')
})

test('test-plugin', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-plugin'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      isPlugin: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-plugin-mode')
})

test('test-unit', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-unit'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      needUnitTest: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-unit-test')
})

test('test-e2e', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-e2e'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      needE2ETest: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-e2e-test')
})

test('test-unocss', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-unocss'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      needUtilityFirstCSS: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-utility-first-css')
})

test('test-typescript', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-typescript'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      needTs: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-typescript')
})

test('test-ssr', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-ssr'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needWeb: true,
      needSSR: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-ssr')
})

test('test-rn', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-rn'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test',
      description: 'test',
      needRn: true,
      rnProjectName: 'CustomRnProject',
      needTs: true,
      needWeb: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx')
  expect(pkg.dependencies).not.toHaveProperty('react')
  expect(pkg.dependencies).not.toHaveProperty('react-native')
  expect(pkg.dependencies).toHaveProperty('react-native-reanimated', '3.16.7')
  expect(pkg.dependencies).toHaveProperty('promise', '^8.3.0')
  expect(pkg.dependencies).not.toHaveProperty('react-native-ble-manager')
  expect(pkg.dependencies).not.toHaveProperty('react-native-wifi-reborn')
  expect(pkg.scripts['serve:ios']).toContain('cd CustomRnProject')
  const mpxConfig = require(path.resolve(cwd, name, 'mpx.config.js'))
  expect(mpxConfig.pluginOptions.mpx.plugin.rnConfig.projectName).toBe('CustomRnProject')
  expect(fs.readFileSync(path.resolve(cwd, name, 'tsconfig.json'), 'utf8')).toContain('"CustomRnProject"')
})

test.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true]
])('Web=%s and SSR=%s control their dependencies independently', async (needWeb, needSSR) => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = `web-prerequisite-${needWeb}-${needSSR}`
  const enableSSR = needWeb && needSSR
  await create(name, { cwd, force: true, git: false }, {
    srcMode: 'wx',
    appid: 'test',
    description: '',
    needWeb,
    needSSR,
    plugins: { '@mpxjs/vue-cli-plugin-mpx-ssr': { version: '^2.0.0' } },
    useConfigFiles: false
  })
  const project = path.join(cwd, name)
  const pkg = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'))
  const config = require(path.join(project, 'mpx.config.js'))
  for (const dependency of ['vue', 'pinia', 'vue-demi', 'vue-router', 'vue-i18n', 'vue-i18n-bridge']) {
    expect(!!pkg.dependencies[dependency]).toBe(needWeb)
  }
  for (const command of ['serve:web', 'build:web']) {
    expect(!!pkg.scripts[command]).toBe(needWeb)
  }
  for (const command of ['serve:ssr', 'build:ssr']) {
    expect(!!pkg.scripts[command]).toBe(enableSSR)
  }
  expect(!!pkg.devDependencies['@mpxjs/vue-cli-plugin-mpx-ssr']).toBe(enableSSR)
  expect(!!config.pluginOptions.SSR).toBe(enableSSR)
  expect(fs.existsSync(path.join(project, 'public/index.html'))).toBe(needWeb)
  expect(fs.existsSync(path.join(project, 'public/index.ssr.html'))).toBe(enableSSR)
  const readme = fs.readFileSync(path.join(project, 'README.md'), 'utf8')
  expect(readme.includes('serve:web')).toBe(needWeb)
  expect(readme.includes('serve:ssr')).toBe(enableSSR)
  expect(fs.existsSync(path.join(project, 'static/ali'))).toBe(true)
  expect(pkg.devDependencies).not.toHaveProperty('@mpxjs/vue-cli-plugin-mpx-web')
  expect(pkg.devDependencies).not.toHaveProperty('@mpxjs/vue-cli-plugin-mpx-rn')
})

test.each([
  ['needSSR', 'ssr', 'build:ssr'],
  ['needEslint', 'eslint', 'lint'],
  ['needUtilityFirstCSS', 'utility-first-css', null]
])('applies %s even when its question is removed', async (option, plugin, script) => {
  const cwd = path.resolve(__dirname, '../../test')
  for (const enabled of [true, false]) {
    const name = `removed-${plugin}-${enabled}`
    const prompt = require('inquirer').prompt
    prompt.mockResolvedValueOnce({ srcMode: 'wx', needWeb: true, appid: 'test', description: '' })
    await create(name, {
      cwd,
      force: true,
      git: false,
      inlinePreset: JSON.stringify({
        [option]: enabled,
        useConfigFiles: true,
        mpxCliPrompts: { remove: [option] }
      })
    })
    const questions = prompt.mock.calls[prompt.mock.calls.length - 1][0]
    expect(questions.some(question => question.name === option)).toBe(false)
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, name, 'package.json'), 'utf8'))
    expect(!!pkg.devDependencies[`@mpxjs/vue-cli-plugin-mpx-${plugin}`]).toBe(enabled)
    if (script) expect(!!pkg.scripts[script]).toBe(enabled)
    if (plugin === 'utility-first-css') {
      expect(!!require(path.join(cwd, name, 'mpx.config.js')).pluginOptions.mpx.unocss).toBe(enabled)
    }
  }
})
