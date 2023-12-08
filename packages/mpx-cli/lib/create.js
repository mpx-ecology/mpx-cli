const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const validateProjectName = require('validate-npm-package-name')
const {
  chalk,
  exit,
  error,
  log,
  stopSpinner
} = require('@vue/cli-shared-utils')
const Creator = require('@vue/cli/lib/Creator')
const loadRemotePreset = require('@vue/cli/lib/util/loadRemotePreset')
const loadLocalPreset = require('@vue/cli/lib/util/loadLocalPreset')
const { getPromptModules } = require('@vue/cli/lib/util/createTools')
const { clearConsole } = require('@vue/cli/lib/util/clearConsole')
const merge = require('lodash.merge')
const prompts = require('./prompts')
const builtInPreset = require('./preset')

async function resolvePreset (args = {}) {
  const { p, preset, c, clone } = args
  let res = {}
  let cliPreset = {}
  if (p || preset) {
    // mpx create foo --preset bar
    cliPreset = p || preset
    if (
      cliPreset.endsWith('.json') ||
      /^\./.test(cliPreset) ||
      path.isAbsolute(cliPreset)
    ) {
      res = await loadLocalPreset(path.resolve(cliPreset))
    } else if (cliPreset.includes('/')) {
      try {
        log(`Fetching remote preset ${chalk.cyan(cliPreset)}...`)
        res = await loadRemotePreset(cliPreset, c || clone)
      } catch (e) {
        error(`Failed fetching remote preset ${chalk.cyan(cliPreset)}:`)
        throw e
      }
    }
  }
  return res
}

async function resolvePrompts () {
  return inquirer.prompt(prompts).then((answers) => answers)
}

async function mergePreset (preset, options) {
  if (options.preset) {
    const remotePreset = await resolvePreset(options)
    merge(preset, remotePreset)
  } else if (options.inlinePreset) {
    try {
      const inlinePreset = JSON.parse(options.inlinePreset)
      merge(preset, inlinePreset)
    } catch (error) {
      error(`CLI inline preset is not valid JSON: ${options.inlinePreset}`)
      exit(1)
    }
  }
  return preset
}
/**
 * 从vue-cli clone 下来，方便处理creator的创建以及生命周期管理
 * @param {*} projectName
 * @param {*} options
 * @param {*} preset
 * @returns
 */
async function create (projectName, options, preset = null) {
  // resolve preset
  if (!preset) {
    // 默认回答
    preset = await resolvePrompts()
    await mergePreset(preset, options)
  }
  // css preprocessor
  preset.cssPreprocessor = 'stylus'

  // mpx cli 插件
  preset.plugins = Object.assign(
    {},
    preset.plugins,
    builtInPreset.plugins
  )

  // 合并问答中的preset
  prompts.forEach(v => {
    if (preset[v.name]) {
      merge(preset, v.preset)
    }
  })

  // 设置代理
  if (options.proxy) {
    process.env.HTTP_PROXY = options.proxy
  }

  const cwd = options.cwd || process.cwd()
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const targetDir = path.resolve(cwd, projectName || '.')

  const result = validateProjectName(name)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors &&
      result.errors.forEach((err) => {
        console.error(chalk.red.dim('Error: ' + err))
      })
    result.warnings &&
      result.warnings.forEach((warn) => {
        console.error(chalk.red.dim('Warning: ' + warn))
      })
    exit(1)
  }

  if (fs.existsSync(targetDir) && !options.merge) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      await clearConsole()
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: 'Generate project in current directory?'
          }
        ])
        if (!ok) {
          return
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(
              targetDir
            )} already exists. Pick an action:`,
            choices: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Merge', value: 'merge' },
              { name: 'Cancel', value: false }
            ]
          }
        ])
        if (!action) {
          return
        } else if (action === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          await fs.remove(targetDir)
        }
      }
    }
  }

  Object.keys(preset.plugins).forEach(function (key) {
    const plugin = preset.plugins[key]
    Object.assign(plugin, {
      srcMode: preset.srcMode,
      appid: preset.appid,
      description: preset.description,
      needE2ETest: preset.needE2ETest,
      needUnitTest: preset.needUnitTest,
      needTs: preset.needTs,
      isPlugin: preset.isPlugin,
      cloudFunc: preset.cloudFunc,
      cross: preset.cross,
      needSSR: preset.needSSR,
      name
    })
  })

  const creator = new Creator(name, targetDir, getPromptModules())

  if (process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG) {
    // 单测下，link bin文件到源码
    const { linkBin } = require('@vue/cli/lib/util/linkBin')
    creator.on('creation', ({ event }) => {
      if (event === 'plugins-install') {
        linkBin(
          require.resolve('@mpxjs/mpx-cli-service/bin/mpx-cli-service'),
          path.join(targetDir, 'node_modules', '.bin', 'mpx-cli-service')
        )
      }
    })
  }

  console.log(preset)

  await creator.create({
    ...options,
    preset: undefined,
    inlinePreset: JSON.stringify(preset)
  })
}

module.exports = function (...args) {
  return create(...args).catch((err) => {
    stopSpinner(false) // do not persist
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
