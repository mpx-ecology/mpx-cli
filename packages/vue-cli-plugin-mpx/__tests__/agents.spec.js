const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const Generator = require('@vue/cli/lib/Generator')
const apply = require('../generator')

let context

beforeEach(() => {
  context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-agents-'))
})

afterEach(() => {
  fs.removeSync(context)
})

async function generate (options = {}, extraPlugins = []) {
  const generator = new Generator(context, {
    pkg: { name: 'test-project', scripts: {}, devDependencies: {} },
    plugins: [{
      id: '@mpxjs/vue-cli-plugin-mpx',
      apply,
      options: { name: 'test-project', srcMode: 'wx', appid: 'test', description: '', ...options }
    }, ...extraPlugins]
  })
  await generator.generate({ extractConfigFiles: true })
  const content = fs.readFileSync(path.join(context, 'AGENTS.md'), 'utf8')
  expect(content).not.toMatch(/<%|%>/)
  return content
}

test('documents mini programs by default without Web', async () => {
  const content = await generate({ needEslint: true, needUnitTest: true, needE2ETest: true })
  expect(content).toContain('## 微信小程序')
  expect(content).toContain('## 支付宝小程序')
  expect(content).not.toContain('## Web')
  expect(content).not.toContain('## RN')
  expect(content).not.toContain('npm run lint')
  expect(content).not.toContain('npm test')
  expect(content).not.toContain('build:e2e')
})

test('the main plugin supplies Web and RN without separate platform plugins', async () => {
  const content = await generate({ needWeb: true, needRn: true, needSSR: true })
  const readme = fs.readFileSync(path.join(context, 'README.md'), 'utf8')
  expect(content).toMatch(/## Web/)
  expect(content).toMatch(/## RN/)
  expect(content).not.toContain('serve:ssr')
  expect(readme).not.toContain('serve:ssr')
  expect(readme).toContain('serve:web')
  expect(readme).toContain('serve:ios')
  expect(readme).toContain('serve:android')
  const pkg = fs.readJsonSync(path.join(context, 'package.json'))
  for (const mode of ['web', 'ios', 'android']) {
    expect(pkg.scripts[`serve:${mode}`]).toContain(`--targets=${mode}`)
    expect(pkg.scripts[`build:${mode}`]).toContain(`--targets=${mode}`)
  }
  expect(pkg.dependencies).toHaveProperty('react-native-reanimated', '3.16.7')
  for (const mode of ['ios', 'android', 'harmony']) {
    expect(fs.existsSync(path.join(context, 'static', mode, '.gitkeep'))).toBe(true)
  }
  expect(fs.readFileSync(path.join(context, 'mpx.config.js'), 'utf8')).toContain('rnConfig')
})

test.each([true, false])('the ESLint plugin supplies lint documentation independently of the main option %s', async (needEslint) => {
  const content = await generate({ needEslint }, [{
    id: '@mpxjs/vue-cli-plugin-mpx-eslint',
    apply: require('../../vue-cli-plugin-mpx-eslint/generator'),
    options: {}
  }])
  expect(fs.readJsonSync(path.join(context, 'package.json')).scripts.lint).toBeDefined()
  expect(content).toContain('npm run lint')
})

test.each(['ali', 'swan', 'qq', 'tt', 'dd'])('documents only the selected %s source platform', async (srcMode) => {
  const content = await generate({ srcMode, needWeb: true })
  expect(content).toContain(`npm run serve -- --targets=${srcMode}`)
  expect(content).toContain(`dist/${srcMode}`)
  expect(content).not.toContain('## 微信小程序')
  expect(content).not.toContain('## Web')
  expect(content).not.toContain('## RN')
  if (srcMode === 'ali') expect(content).toContain('component2')
})

test.each(['cloudFunc', 'isPlugin'])('uses the nested mini program entry for %s projects', async (option) => {
  const content = await generate({ [option]: true, needWeb: false })
  expect(content).toContain('src/miniprogram/app.mpx')
  expect(content).toContain('工具导入目录仍为 `dist/wx`')
  expect(content).toContain(option === 'cloudFunc' ? 'src/functions/' : 'src/plugin/')
  expect(content).not.toContain('`src/app.mpx`')
  expect(content).not.toContain('## 支付宝小程序')
  expect(fs.existsSync(path.join(context, 'static/ali'))).toBe(false)
})
