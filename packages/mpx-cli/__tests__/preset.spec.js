jest.mock('inquirer')

const path = require('path')
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
      plugins: {}
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx')
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
      plugins: {}
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
      plugins: {}
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
      plugins: {}
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
      plugins: {}
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
      plugins: {}
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
      plugins: {}
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-e2e-test')
})
