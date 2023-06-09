const path = require('path')
const glob = require('glob')
const execa = require('execa')
const minimist = require('minimist')

const parsedArgs = minimist(process.argv.slice(2))
console.log('file: sync-mirror.js:7 > parsedArgs:', parsedArgs.mirror)

Promise.all(
  glob
    .sync('packages/{vue-cli-plugin-*,mpx-cli,mpx-cli-service}/package.json', {
      cwd: path.resolve(process.cwd()),
      stat: true
    })
    .map((v) => {
      const pkg = require(path.resolve(process.cwd(), v))
      console.log('Syncing', pkg.name, '...')
      return execa('curl', [`${parsedArgs.mirror}${pkg.name}`])
    })
).then(() => {
  console.log(`sync to ${parsedArgs.mirror} success`)
})
