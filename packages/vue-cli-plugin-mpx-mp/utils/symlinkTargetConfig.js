const fs = require('fs')
const path = require('path')
const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')

module.exports.symLinkTargetConfig = function (api, targets, webpackConfigs) {
  // 为配置文件创建symlink
  targets.forEach((target, k) => {
    const config = webpackConfigs[k]
    const outputPath = config.output.path
    const targetConfigFiles = MODE.MODE_CONFIG_FILES_MAP[target.mode] || []
    targetConfigFiles.forEach((v) => {
      fs.symlinkSync(
        api.resolve(`static/${target.mode}/${v}`),
        path.resolve(outputPath, v)
      )
    })
  })
}
