jest.mock('inquirer')
const path = require('path')
const create = require('@mpxjs/cli/lib/create')

test('test-theme', async () => {
  const cwd = path.resolve(__dirname, '../../test')
  const name = 'test-theme'
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
      plugins: {
        '@mpxjs/vue-cli-plugin-mpx-theme': {
          version: '2.1.4'
        }
      },
      useConfigFiles: true
    }
  )

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@mpxjs/vue-cli-plugin-mpx-theme')
})
