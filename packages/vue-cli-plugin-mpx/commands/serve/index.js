const { getCurrentTarget, SUPPORT_MODE, normalizeCommandArgs } = require('@mpxjs/cli-shared-utils')
const fs = require('fs-extra')
const { serveWeb } = require('./web')
const { serveMp } = require('./mp')
const { addServeWebpackConfig } = require('../../config/base')

const defaults = {
  clean: true
}

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.registerServeCommand = function (api, options) {
  api.registerCommand(
    'serve',
    {
      description: 'mpx development',
      usage: 'mpx-cli-service serve',
      options: {
        '--targets': `compile for target platform, support ${SUPPORT_MODE}`,
        '--mode': 'specify env mode (default: development)',
        '--no-clean':
          'do not remove the dist directory contents before building the project',
        '--env': 'custom define __mpx_env__'
      }
    },
    function build (args, rawArgv) {
      normalizeCommandArgs(args, defaults)
      if (args.clean) {
        fs.removeSync(options.outputDir)
      }
      const target = getCurrentTarget()
      api.chainWebpack((config) => {
        addServeWebpackConfig(api, options, config, target, args)
      })
      return target.mode === 'web'
        ? serveWeb(api, options, args)
        : serveMp(api, options, args)
    }
  )
}
