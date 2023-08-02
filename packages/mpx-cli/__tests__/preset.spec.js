jest.mock('inquirer')
const glob = require('glob')
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

// 封装一个方法，用来生成项目，然后将配置项作为参数传入
const createProject = async (name, options) => {
  const cwd = path.resolve(__dirname, '../../test')
  await create(
    name,
    {
      force: true,
      git: false,
      cwd
    },
    options
    // srcMode: 'wx' 表示小程序的类型是微信小程序
    // appid: 'test-yao-1.0.0' 表示小程序的appid
    // description: 'test' 表示小程序的描述
    // cross: true 表示是否跨平台
    // needE2ETest: true 表示是否需要e2e测试
    // plugins: {} 表示插件
    // useConfigFiles: true 表示是否使用配置文件
  )
}

// wx模式
test('test-wx', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-wx'
  await createProject(name, {
    srcMode: 'wx',
    appid: 'test-plugin-have-appid',
    description: 'test-plugin-have-description',
    cross: true,
    needE2ETest: true,
    plugins: {},
    useConfigFiles: true
  })
  // 生成的目录下是否包含了wx目录，ali目录，swan目录，tt目录，dd目录
  const staticWxDir = fs.existsSync(path.resolve(cwd, name, 'static/wx'))
  const staticAliDir = fs.existsSync(path.resolve(cwd, name, 'static/ali'))
  const staticSwanDir = fs.existsSync(path.resolve(cwd, name, 'static/swan'))
  const staticQqDir = fs.existsSync(path.resolve(cwd, name, 'static/qq'))
  const staticDdDir = fs.existsSync(path.resolve(cwd, name, 'static/dd'))
  const staticTtDir = fs.existsSync(path.resolve(cwd, name, 'static/tt'))
  expect(staticWxDir).toBe(true)
  expect(staticAliDir).toBe(true)
  expect(staticSwanDir).toBe(true)
  expect(staticQqDir).toBe(false)
  expect(staticDdDir).toBe(true)
  expect(staticTtDir).toBeTruthy()

  // 生成的appid是否是test-plugin-have-appid
  const projectConfig = require(path.resolve(cwd, name, 'static/wx/project.config.json'))
  expect(projectConfig.appid).toBe('test-plugin-have-appid')

  // 生成的description是否是test-plugin-have-description
  expect(projectConfig.description).toBe('test-plugin-have-description')

  // 保存快照
  // 检查生成的目录是否和预期的目录一致
  expect({
    staticWxDir,
    staticAliDir,
    staticSwanDir,
    staticQqDir,
    staticDdDir,
    staticTtDir
  }).toMatchSnapshot()

  // 检查生成的目录下的project.config.json文件是否和预期的一致
  expect(projectConfig).toMatchSnapshot()
})

// 测试插件是否存在,wx模式
test('test-plugin-have', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-plugin-have'
  await createProject(name, {
    srcMode: 'wx',
    appid: 'test-plugin-have-appid',
    description: 'test-plugin-have-description',
    cross: true,
    needE2ETest: true,
    plugins: {},
    useConfigFiles: true
  })

  // 有没有 @mpxjs/babel-plugin-inject-page-events 这个依赖
  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/babel-plugin-inject-page-events')
})

// 将srcMode改成ali，生成的static/ali目录是否存在，还是否存在wx目录
test('test-ali', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-ali'
  await createProject(name, {
    srcMode: 'ali',
    appid: 'test-ali-appid',
    description: 'test-ali-description',
    cross: true,
    needE2ETest: true,
    plugins: {},
    useConfigFiles: true
  })

  const staticWxDir = glob.sync(path.resolve(cwd, name, 'static/wx'))
  const staticAliDir = glob.sync(path.resolve(cwd, name, 'static/ali'))
  expect(staticWxDir.length).toBe(0) // 确保 static/wx 目录不存在
  expect(staticAliDir.length).toBeGreaterThan(0) // 确保 static/ali 目录存在

  // 保存快照
  // 检查生成的目录是否和预期的目录一致
  expect({
    staticWxDir,
    staticAliDir
  }).toMatchSnapshot()
})

// 插件组合测试
test('test-plugin-combine', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-plugin-combine'
  await createProject(name, {
    srcMode: 'wx',
    appid: 'test-plugin-combine-appid',
    description: 'test-plugin-combine-description',
    cross: true,
    needE2ETest: true,
    plugins: {
      '@mpxjs/vue-cli-plugin-mpx': {
        version: '^2.0.0'
      },
      '@mpxjs/vue-cli-plugin-mpx-typescript': {
        version: '^2.0.0'
      },
      '@mpxjs/vue-cli-plugin-mpx-unit-test': {
        version: '^2.0.0'
      },
      '@mpxjs/vue-cli-plugin-mpx-e2e-test': {
        version: '^2.0.0'
      }
    },
    useConfigFiles: true
  })

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx')
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-typescript')
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-unit-test')
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-e2e-test')

  // 查看上面五个插件的版本是否正确
  expect(pkg.devDependencies['@mpxjs/vue-cli-plugin-mpx']).toBe('^2.0.0')
  expect(pkg.devDependencies['@mpxjs/vue-cli-plugin-mpx-typescript']).toBe('^2.0.0')
  expect(pkg.devDependencies['@mpxjs/vue-cli-plugin-mpx-unit-test']).toBe('^2.0.0')
  expect(pkg.devDependencies['@mpxjs/vue-cli-plugin-mpx-e2e-test']).toBe('^2.0.0')

  // 保存快照
  // 检查生成的文件是否和预期的一致
  expect(pkg).toMatchSnapshot()
})
