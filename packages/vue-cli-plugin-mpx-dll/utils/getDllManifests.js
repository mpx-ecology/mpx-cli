const fs = require('fs')
const path = require('path')
const resolveDllConf = require('./resolveDllConf')
const { supportedModes } = require('vue-cli-plugin-mpx')

module.exports = function getDllManifests(api, mode) {
  const dllConf = resolveDllConf(api)
  if (!dllConf) {
    return
  }
  const result = []
  const basePath = path.resolve(dllConf.path, mode)
  if (fs.existsSync(basePath)) {
    const files = fs.readdirSync(basePath)
    files.forEach((file) => {
      if (/\.manifest\.json$/.test(file)) {
        const content = JSON.parse(
          fs.readFileSync(path.join(basePath, file), 'utf8')
        )
        const filename = path.basename(content.name)
        const modeReg = new RegExp(`^(${supportedModes.join('|')})\\.`)

        let mode = ''
        if (modeReg.test(filename)) {
          mode = modeReg.exec(filename)[1]
        }
        result.push({
          mode,
          content
        })
      }
    })
  }

  return result
}
