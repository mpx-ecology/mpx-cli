const { resolveBaseConfig } = require('./config/base')
const { registerInspectCommand } = require('./commands/inspect')
const { registerBuildCommand } = require('./commands/build')
const { registerServeCommand } = require('./commands/serve')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils')
const path = require('path')
const { resolveBabelConfig } = require('./config/babel')

function normalizeOutputPath (api, options, target) {
  const { outputDir } = options
  // 如果是dist目录，则代表没有修改outputPath，采用默认拼target
  options.outputDir = outputDir !== 'dist' ? outputDir : `dist/${target.mode}`
  if (
    target.mode === 'wx' &&
    (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode'))
  ) {
    const projectConfigJson = require(api.resolve(
      'static/wx/project.config.json'
    ))
    options.outputDir = path.join(
      options.outputDir,
      projectConfigJson.miniprogramRoot
    )
  }
}

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function (api, options) {
  // 注册命令
  registerBuildCommand(api, options)
  registerServeCommand(api, options)
  registerInspectCommand(api, options)

  // 获取当前的构建目标
  const target = getCurrentTarget()

  // 修正输出路径
  normalizeOutputPath(api, options, target)

  // 注入基础配置
  api.chainWebpack((config) => {
    resolveBaseConfig(api, options, config, target)
    resolveBabelConfig(api, options, config, target)
  })
}

module.exports.defaultModes = {
  serve: 'development',
  build: 'production',
  inspect: 'development'
}
