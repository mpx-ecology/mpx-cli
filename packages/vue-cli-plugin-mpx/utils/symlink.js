const fs = require('fs')
const path = require('path')
const { MODE_CONFIG_FILES_MAP, SUPPORT_PLUGIN_MODE } = require('@mpxjs/cli-shared-utils')

function copyDirSync (src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const items = fs.readdirSync(src)
  items.forEach((item) => {
    const srcPath = path.resolve(src, item)
    const destPath = path.resolve(dest, item)
    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

/**
 * 为配置文件添加symlink，保证IDE修改配置文件也会同步到static下
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@mpxjs/cli-shared-utils').Target } target
 * @param { import('webpack').Configuration } webpackConfig
 * @param { object } options
 */
module.exports.symlinkTargetConfig = function (api, target, webpackConfig, options) {
  const targetConfigFiles = MODE_CONFIG_FILES_MAP[target.mode] || []
  let outputPath = webpackConfig.output.path
  targetConfigFiles.forEach((v) => {
    if (
      SUPPORT_PLUGIN_MODE.includes(target.mode) &&
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
  try {
    const isRn = (target.mode === 'android') | (target.mode === 'ios') | (target.mode === 'harmony')
    if (isRn) {
      const mpxOptions = options && options.pluginOptions && options.pluginOptions.mpx
      const rnConfig = mpxOptions && mpxOptions.plugin && mpxOptions.plugin.rnConfig
      const rnProjectPath = path.resolve(process.cwd(), (rnConfig && rnConfig.projectName) || 'ReactNativeProject')
      const items = fs.readdirSync(outputPath)
      items.forEach((item) => {
        const src = path.resolve(outputPath, item)
        const dest = path.resolve(rnProjectPath, item)
        const stat = fs.statSync(src)
        if (stat.isDirectory()) {
          copyDirSync(src, dest)
        } else {
          fs.copyFileSync(src, dest)
        }
      })
      const rnEntryFile = path.resolve(rnProjectPath, 'index.js')
      fs.writeFileSync(rnEntryFile, "require('./app.js');\n")
    }
  } catch (error) {

  }
}
