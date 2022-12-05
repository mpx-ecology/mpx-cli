const fs = require('fs')
const path = require('path')
const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')

module.exports.symLinkTargetConfig = function (api, targets) {
  // 为配置文件创建symlink
  targets.forEach((target, k) => {
    const targetConfigFiles = MODE.MODE_CONFIG_FILES_MAP[target.mode] || []
    targetConfigFiles.forEach((v) => {
      fs.linkSync(
        api.resolve(`static/${target.mode}/${v}`),
        path.resolve(api.resolve(`dist/${target.mode}`), v)
      )
    })
  })
}
