const minimist = require('minimist')
const path = require('path')
const inquirer = require('inquirer')
const { chalk, exit, error, log } = require('@vue/cli-shared-utils')
const loadRemotePreset = require('@vue/cli/lib/util/loadRemotePreset')
const loadLocalPreset = require('@vue/cli/lib/util/loadLocalPreset')
const vueCreate = require('@vue/cli/lib/create')

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

module.exports = async function (appName, options, preset = null) {
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
      preset = await resolvePrompts(appName, builtInPreset)
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
  console.log({
    ...options,
    inlinePreset: JSON.stringify(preset)
  })
  return vueCreate(appName, {
    ...options,
    inlinePreset: JSON.stringify(preset)
  })
}
