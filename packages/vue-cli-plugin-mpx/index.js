const applyBaseMpxConfig = require('./config/base')
const registerMpBuildCommand = require('./commands/mp/build')
const registerMpServeCommand = require('./commands/mp/serve')
const registerMpInspectCommand = require('./commands/mp/inspect')
const registerWebBuildCommand = require('./commands/web/build')
const registerWebServeCommand = require('./commands/web/serve')
const registerWebInspectCommand = require('./commands/web/inspect')
const { transformMpxEntry } = require('./config/transformMpxEntry')
const { buildTargetInChildProcess } = require('./utils/webpack')
const { getTargets } = require('./utils')
const { resolveMpBaseWebpackConfig } = require('./config/mp/base')
const { resolveMpTargetConfig } = require('./config/mp/target')
const { resolveWebBaseWebpackConfig } = require('./config/web/base')
const { SUPPORT_MODE } = require('./constants/mode')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = function (api, options) {
  // 当前构建的目标
  const currentTarget = {
    mode: process.env.MPX_CURRENT_TARGET_MODE,
    env: process.env.MPX_CURRENT_TARGET_ENV
  }

  // 修改web构建输出位置
  if (currentTarget.mode === 'web') {
    if (options.outputDir === 'dist') {
      options.outputDir = 'dist/web'
    }
  }

  // register command
  registerWebBuildCommand(api, options)
  registerWebServeCommand(api, options)
  registerWebInspectCommand(api, options)
  registerMpBuildCommand(api, options)
  registerMpServeCommand(api, options)
  registerMpInspectCommand(api, options)

  // 替换build和serve命令
  api.registerCommand(
    'build',
    {
      description: 'mp production',
      usage: 'mpx-cli-service build:mp',
      options: {
        '--targets': `compile for target platform, support ${SUPPORT_MODE}`,
        '--watch': 'compile in watch mode',
        '--report': 'generate report.html to help analyze bundle content',
        '--open-child-process': 'open child process',
        '--env': 'custom define __mpx_env__'
      }
    },
    function build (args, rawArgv) {
      const targets = getTargets(args, options)
      return Promise.all(
        targets.map((target) =>
          target.mode === 'web'
            ? buildTargetInChildProcess('build:web', rawArgv, {
              target,
              watch: false
            })
            : buildTargetInChildProcess('build:mp', rawArgv, {
              target,
              watch: false
            })
        )
      )
    }
  )

  api.registerCommand('serve', (args, rawArgv) => {
    const targets = getTargets(args, options)
    return Promise.all(
      targets.map((target) =>
        target.mode === 'web'
          ? buildTargetInChildProcess('serve:web', rawArgv, {
            target,
            watch: false
          })
          : buildTargetInChildProcess('serve:mp', rawArgv, {
            target,
            watch: false
          })
      )
    )
  })

  api.chainWebpack((config) => {
    applyBaseMpxConfig(api, options, config)
    if (currentTarget.mode === 'web') {
      resolveWebBaseWebpackConfig(api, options, config)
    } else {
      // 修改基础配置
      resolveMpBaseWebpackConfig(api, options, config, currentTarget)
      // 根据不同target修改webpack配置
      resolveMpTargetConfig(api, options, config, currentTarget)
      // 转换entry
      transformMpxEntry(api, options, config)
    }
  })
}

module.exports.MODE = require('./constants/mode')
module.exports.defaultModes = {
  'serve:mp': 'development',
  'serve:web': 'development',
  'build:mp': 'production',
  'build:web': 'production',
  'inspect:mp': 'production',
  'inspect:web': 'production'
}
