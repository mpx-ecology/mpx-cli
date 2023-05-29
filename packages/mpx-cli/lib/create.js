const minimist = require('minimist')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const validateProjectName = require('validate-npm-package-name')
const { chalk, exit, error, log, stopSpinner } = require('@vue/cli-shared-utils')
const Creator = require('@vue/cli/lib/Creator')
const loadRemotePreset = require('@vue/cli/lib/util/loadRemotePreset')
const loadLocalPreset = require('@vue/cli/lib/util/loadLocalPreset')
const { getPromptModules } = require('@vue/cli/lib/util/createTools')
const { clearConsole } = require('@vue/cli/lib/util/clearConsole')
const { linkBin } = require('@vue/cli/lib/util/linkBin')
const prompts = require('./prompts')
const plugins = require('./plugins')
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

async function create (projectName, options, preset = { plugins: {} }) {
  const args = process.argv.slice(2)
  const parsedArgs = minimist(args)
  if (!preset) {
    if (options.preset) {
      preset = await resolvePreset(parsedArgs)
    } else if (options.inlinePreset) {
      try {
        preset = JSON.parse(options.inlinePreset)
      } catch (error) {
        error(`CLI inline preset is not valid JSON: ${options.inlinePreset}`)
        exit(1)
      }
    } else {
      preset = await resolvePrompts(projectName, builtInPreset)
    }
  }
  preset.cssPreprocessor = 'stylus'
  Object.assign(preset.plugins, builtInPreset.plugins)

  if (preset.needTs) {
    Object.assign(preset.plugins, plugins.tsSupport)
  }
  if (preset.cloudFunc) {
    Object.assign(preset.plugins, plugins.cloudFunc)
  }
  if (preset.isPlugin) {
    Object.assign(preset.plugins, plugins.isPlugin)
  }
  if (preset.needUnitTest) {
    Object.assign(preset.plugins, plugins.unitTestSupport)
  }
  if (preset.needE2ETest) {
    Object.assign(preset.plugins, plugins.e2eTestSupport)
  }

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
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
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
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
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
    const plugin = builtInPreset.plugins[key]
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
      name
    })
  })

  const creator = new Creator(name, targetDir, getPromptModules())

  if (process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG) {
    creator.on('creation', ({ event }) => {
      if (event === 'plugins-install') {
        linkBin(
          require.resolve('@mpxjs/mpx-cli-service/bin/mpx-cli-service'),
          path.join(targetDir, 'node_modules', '.bin', 'mpx-cli-service')
        )
      }
    })
  }

  await creator.create({
    ...options,
    inlinePreset: JSON.stringify(preset)
  })
}

module.exports = function (...args) {
  return create(...args).catch(err => {
    stopSpinner(false) // do not persist
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
