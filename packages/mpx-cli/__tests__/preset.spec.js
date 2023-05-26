jest.mock('inquirer')

const path = require('path')
const fs = require('fs-extra')
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
      needE2ETest: false,
      needUnitTest: false,
      needTs: false,
      isPlugin: false,
      cloudFunc: false,
      cross: true,
      plugins: {}
    }
  )

  const testFile = await fs.readFile(path.resolve(cwd, name, 'test.js'), 'utf-8')
  expect(testFile).toBe('true')

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@vue/cli-plugin-babel')
})
