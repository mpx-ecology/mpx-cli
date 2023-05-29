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
