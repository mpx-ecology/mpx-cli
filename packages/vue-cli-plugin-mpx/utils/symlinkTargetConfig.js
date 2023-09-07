const fs = require('fs')
const path = require('path')
const { MODE_CONFIG_FILES_MAP } = require('@mpxjs/cli-shared/constant')

/**
 * 为配置文件添加symlink，保证IDE修改配置文件也会同步到static下
 * @param {*} api
 * @param {*} target
 * @param {*} webpackConfig
 */
module.exports.symlinkTargetConfig = function (api, target, webpackConfig) {
  const targetConfigFiles = MODE_CONFIG_FILES_MAP[target.mode] || []
  let outputPath = webpackConfig.output.path
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
}
