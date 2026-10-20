const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const execa = require('execa')
const { symlinkTargetConfig } = require('../utils/symlink')

let context

beforeEach(() => {
  context = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-output-'))
})

afterEach(() => {
  fs.removeSync(context)
})

function syncOutput (mode, revision = 1, projectName = 'ReactNativeProject') {
  const outputPath = path.join(context, 'dist', mode)
  fs.outputFileSync(path.join(outputPath, 'app.js'), "global.mpxResult = require('./chunks/page.js')\n")
  fs.outputFileSync(path.join(outputPath, 'chunks/page.js'), "module.exports = require('../assets/icon.json')\n")
  fs.outputJsonSync(path.join(outputPath, 'assets/icon.json'), { mode, revision })
  fs.outputJsonSync(path.join(outputPath, 'app.js.map'), { mode, revision })
  symlinkTargetConfig({}, { mode }, { output: { path: outputPath } }, {
    pluginOptions: { mpx: { plugin: { rnConfig: { projectName: path.join(context, projectName) } } } }
  })
  return path.join(context, projectName)
}

async function runEntry (host, mode) {
  const { stdout } = await execa(process.execPath, ['-e', `require('./mpx-entry.${mode}.js'); console.log(JSON.stringify(global.mpxResult))`], { cwd: host })
  return JSON.parse(stdout)
}

test.each(['ios', 'android', 'harmony'])('%s can run its entry and relative resources without another platform build', async (mode) => {
  const host = syncOutput(mode)
  expect(fs.readFileSync(path.join(host, 'index.js'), 'utf8')).toBe("require('./mpx-entry');\n")
  expect(fs.readFileSync(path.join(host, `mpx-entry.${mode}.js`), 'utf8')).toBe(`require('./mpx-build/${mode}/app.js');\n`)
  expect(fs.readdirSync(path.join(host, 'mpx-build'))).toEqual([mode])
  expect(await runEntry(host, mode)).toEqual({ mode, revision: 1 })
  expect(fs.existsSync(path.join(host, 'app.js'))).toBe(false)
})

test('interleaved platform builds preserve the other platform and native host files', async () => {
  const host = syncOutput('ios', 1, 'CustomRnProject')
  fs.outputFileSync(path.join(host, 'ios/Podfile'), 'native config')
  syncOutput('android', 1, 'CustomRnProject')
  syncOutput('ios', 2, 'CustomRnProject')

  expect(await runEntry(host, 'ios')).toEqual({ mode: 'ios', revision: 2 })
  expect(await runEntry(host, 'android')).toEqual({ mode: 'android', revision: 1 })
  expect(fs.readJsonSync(path.join(host, 'mpx-build/ios/app.js.map'))).toEqual({ mode: 'ios', revision: 2 })
  expect(fs.readJsonSync(path.join(host, 'mpx-build/android/app.js.map'))).toEqual({ mode: 'android', revision: 1 })
  expect(fs.readFileSync(path.join(host, 'ios/Podfile'), 'utf8')).toBe('native config')
  expect(fs.readFileSync(path.join(host, 'index.js'), 'utf8')).toBe("require('./mpx-entry');\n")
})
