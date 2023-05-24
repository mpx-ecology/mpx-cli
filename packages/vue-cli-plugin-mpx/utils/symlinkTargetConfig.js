const fs = require('fs')
const path = require('path')
const { MODE_CONFIG_FILES_MAP } = require('../constants/mode')

module.exports.symLinkTargetConfig = function (api, targets, webpackConfigs) {
  // 为配置文件创建symlink
  targets.forEach((target, k) => {
    const config = webpackConfigs[k]
    const targetConfigFiles = MODE_CONFIG_FILES_MAP[target.mode] || []
    let outputPath = config.output.path
    targetConfigFiles.forEach((v) => {
      if (
        target.mode === 'wx' &&
        (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode'))
      ) {
        outputPath = path.resolve(outputPath, '../')
      }
      try {
        const targetConfigFile = path.resolve(outputPath, v)
        if (fs.existsSync(targetConfigFile)) fs.unlinkSync(targetConfigFile)
        fs.linkSync(api.resolve(`static/${target.mode}/${v}`), targetConfigFile)
      } catch (error) {
        fs.copyFileSync(
          api.resolve(`static/${target.mode}/${v}`),
          path.resolve(outputPath, v)
        )
      }
    })
  })
}
