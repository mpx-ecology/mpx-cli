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

// 测试一下 test-yao-1.0.0 这个项目，有没有 @mpxjs/babel-plugin-inject-page-events 这个依赖
test('test-yao-1.0.0', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-yao-1.0.0'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test-yao-1.0.0',
      description: 'test',
      cross: true,
      needE2ETest: true,
      plugins: {},
      useConfigFiles: true
      // srcMode: 'wx' 表示小程序的类型是微信小程序
      // appid: 'test-yao-1.0.0' 表示小程序的appid
      // description: 'test' 表示小程序的描述
      // cross: true 表示是否跨平台
      // needE2ETest: true 表示是否需要e2e测试
      // plugins: {} 表示插件
      // useConfigFiles: true 表示是否使用配置文件
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/babel-plugin-inject-page-events')
})

// 将srcMode改成ali，测试一下 test-yao-1.0.1 这个项目生成的static/ali目录是否存在，还是否存在wx目录
test('test-yao-1.0.1', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-yao-1.0.1'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'ali',
      appid: 'test-yao-1.0.1',
      description: 'test',
      cross: true,
      needE2ETest: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const staticWxDir = fs.existsSync(path.resolve(cwd, name, 'static/wx'))
  const staticAliDir = fs.existsSync(path.resolve(cwd, name, 'static/ali'))
  expect(staticWxDir).toBe(false)
  expect(staticAliDir).toBe(true)
  // a: 1. fs.existsSync(path.resolve(cwd, name, 'static/wx')) 判断static/wx目录是否存在，如果存在返回true，不存在返回false
  // a: 2. fs.existsSync(path.resolve(cwd, name, 'static/ali')) 判断static/ali目录是否存在，如果存在返回true，不存在返回false
  // a: 3. expect(staticWxDir).toBe(false) 判断staticWxDir是否为false，如果为false则测试通过，如果为true则测试失败
  // a: 4. expect(staticAliDir).toBe(true) 判断staticAliDir是否为true，如果为true则测试通过，如果为false则测试失败
})

// 测试一下 test-yao-1.0.0 这个项目，有没有 @mpxjs/babel-plugin-inject-page-events 这个依赖
test('test-yao-vue-1.0.0', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-yao-vue-1.0.0'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'wx',
      appid: 'test-yao-vue-1.0.0',
      description: 'test',
      cross: true,
      needE2ETest: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/babel-plugin-inject-page-events')
})

// 将srcMode改成ali，测试一下 test-yao-1.0.1 这个项目生成的static/ali目录是否存在，还是否存在wx目录,是否还有 @mpxjs/babel-plugin-inject-page-events 这个依赖
test('test-yao-vue-1.0.1', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-yao-vue-1.0.1'
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    {
      srcMode: 'ali',
      appid: 'test-yao-vue-1.0.1',
      description: 'test',
      cross: true,
      needE2ETest: true,
      plugins: {},
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/babel-plugin-inject-page-events')
})
