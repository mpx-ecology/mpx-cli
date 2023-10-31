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
      cross: true,
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
      cross: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx')
})

/**
 * 非跨平台项目不生成static/ali目录
 */
test('normal-nocross', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'normal-nocross'
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
      cross: false,
      plugins: {},
      useConfigFiles: true
    }
  )

  const staticAliDir = fs.existsSync(path.resolve(cwd, name, 'static/ali'))
  expect(staticAliDir).toBe(false)
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
      cross: true,
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
      cross: true,
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
      cross: true,
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
      cross: true,
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
      cross: true,
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
      cross: true,
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
      cross: true,
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
      cross: true,
      needTs: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-typescript')
})
