const fs = require('fs')
const path = require('path')
const { MODE } = require('@mpxjs/vue-cli-plugin-mpx')

module.exports.symLinkTargetConfig = function (api, targets, webpackConfigs) {
  // 为配置文件创建symlink
  targets.forEach((target, k) => {
    const config = webpackConfigs[k]
    const targetConfigFiles = MODE.MODE_CONFIG_FILES_MAP[target.mode] || []
    let outputPath = config.output.path
    targetConfigFiles.forEach((v) => {
      if (
        target.mode === 'wx' &&
        (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode'))
      ) {
        outputPath = path.resolve(outputPath, '../')
      }
      try {
        fs.unlinkSync(path.resolve(outputPath, v))
        fs.linkSync(
          api.resolve(`static/${target.mode}/${v}`),
          path.resolve(outputPath, v)
        )
      } catch (error) {
        fs.copyFile(
          api.resolve(`static/${target.mode}/${v}`),
          path.resolve(outputPath, v)
        )
      }
    })
  })
}
