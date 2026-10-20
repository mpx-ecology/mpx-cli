const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const Generator = require('@vue/cli/lib/Generator')
const apply = require('../../vue-cli-plugin-mpx/generator')

let context

beforeEach(() => {
  context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-agents-'))
})

afterEach(() => {
  fs.removeSync(context)
})

async function generate (options = {}, extraPlugins = []) {
  const selected = [
    ['needSSR', 'ssr'], ['needEslint', 'eslint'],
    ['needUnitTest', 'unit-test'], ['needE2ETest', 'e2e-test']
  ].filter(([option]) => options[option])
  extraPlugins = selected.map(([, name]) => ({
    id: `@mpxjs/vue-cli-plugin-mpx-${name}`,
    apply: require(`../../vue-cli-plugin-mpx-${name}/generator`),
    options
  })).concat(extraPlugins)
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

test('the main and SSR plugins supply their own documentation once', async () => {
  const content = await generate({ needWeb: true, needRn: true, needSSR: true })
  for (const heading of ['## Web\n', '## RN iOS', '## RN Android', '## Web SSR']) {
    expect(content.split(heading)).toHaveLength(2)
    expect(content.indexOf(heading)).toBeLessThan(content.indexOf('## 校验与交付'))
  }
  const readme = fs.readFileSync(path.join(context, 'README.md'), 'utf8')
  expect(readme.split('## Web SSR')).toHaveLength(2)
  for (const command of ['serve:web', 'serve:ios', 'serve:android', 'serve:ssr', 'build:ssr']) {
    expect(readme).toContain(`npm run ${command}`)
  }
  expect(readme).toContain('原生宿主目录：`ReactNativeProject/`')
})

test('cross-platform output includes mini programs and Web but not unselected RN or SSR', async () => {
  const content = await generate({ needWeb: true })
  expect(content).toContain('## 微信小程序')
  expect(content).toContain('## 支付宝小程序')
  expect(content).toContain('component2')
  expect(content).toContain('## Web')
  expect(content).toContain('npm run serve -- --targets=swan')
  expect(content).not.toContain('## RN')
  expect(content).not.toContain('serve:ssr')
})

test.each([undefined, 'CustomRnProject'])('RN without cross-platform Web uses the selected host name %s', async (rnProjectName) => {
  const content = await generate({ needRn: true, rnProjectName })
  const host = rnProjectName || 'ReactNativeProject'
  expect(content).toContain('## RN iOS')
  expect(content).toContain('## RN Android')
  expect(content).toContain(`cd ${host} && npm start`)
  expect(content).toContain(`cd ${host} && npm run android`)
  expect(content).toContain(`cd ${host}\n   bundle install\n   cd ios\n   bundle exec pod install\n   cd ..\n   npm run ios`)
  expect(content).toContain('npm run serve -- --targets=ios')
  expect(content).toContain('npm run serve -- --targets=android')
  expect(content).toContain('第 2、3 步按情况选择其一')
  expect(content).not.toContain('## Web')
  expect(content).toContain('## 支付宝小程序')
  if (rnProjectName) expect(content).not.toContain('ReactNativeProject')
})

test('includes selected SSR, lint and test workflows with all platforms', async () => {
  const content = await generate({
    needWeb: true,
    needRn: true,
    needSSR: true,
    needEslint: true,
    needUnitTest: true,
    needE2ETest: true
  })
  for (const command of ['serve:ssr', 'build:ssr', 'lint', 'build:e2e']) {
    expect(content).toContain(`npm run ${command}`)
  }
  expect(content).toContain('npm test')
  expect(content).toContain('## RN iOS')
  expect(content).toContain('## Web')
})
