#!/usr/bin/env node

const path = require('path')
const execa = require('execa')
const minimist = require('minimist')
const vueCliBinPath = require.resolve('@vue/cli/bin/vue')
const builtInPreset = require('../lib/preset')
const inquirer = require('inquirer')
const prompts = require('../lib/prompts')
const plugins = require('../lib/plugins')
const loadRemotePreset = require('@vue/cli/lib/util/loadRemotePreset')
const loadLocalPreset = require('@vue/cli/lib/util/loadLocalPreset')
const {
  chalk,
  exit,
  error,
  log
} = require('@vue/cli-shared-utils')
const merge = require('lodash.merge')

const args = process.argv.slice(2)
const parsedArgs = minimist(args)

async function resolvePreset(args = {}) {
  const { p, preset, i, inlinePreset, c, clone } = args
  let res = {}
  let cliPreset = {}
  if (p || preset) {
    // mpx create foo --preset bar
    cliPreset = p || preset
    if (cliPreset.endsWith('.json') || /^\./.test(cliPreset) || path.isAbsolute(cliPreset)) {
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
  } else if (i || inlinePreset) {
    // mpx create foo --inlinePreset {...}
    cliPreset = i || inlinePreset
    try {
      res = JSON.parse(cliPreset)
    } catch (e) {
      error(`CLI inline preset is not valid JSON: ${cliPreset}`);
      exit(1)
    }
  }
  return res
}

async function resolvePrompts(name, builtInPreset) {
  return new Promise(function(resolve) {
    inquirer.prompt(prompts).then(answers => {
      if (answers.needTs) {
        Object.assign(builtInPreset.plugins, plugins.tsSupport)
      }
      if (answers.cloudFunc) {
        Object.assign(builtInPreset.plugins, plugins.cloudFunc)
      }
      if (answers.isPlugin) {
        Object.assign(builtInPreset.plugins, plugins.isPlugin)
      }
      if (answers.transWeb) {
        Object.assign(builtInPreset.plugins, plugins.transWeb)
      }
      // TODO: 添加其他 prompt 插件配置

      // 各插件共享 answers 配置
      Object.keys(builtInPreset.plugins).forEach(function(key) {
        let plugin = builtInPreset.plugins[key]
        plugin = Object.assign(plugin, {
          ...answers,
          name
        })
      })

      resolve(builtInPreset)
    })
  })
}

function regenCmd() {
  const cmd = [...parsedArgs._, '--skipGetStarted']
  const ignoreKey = ['_', 'p', 'preset', 'i', 'inlinePreset']
  Object.keys(parsedArgs).map((key = '') => {
    if (key && !ignoreKey.includes(key)) {
      cmd.push(key.length > 1 ? `--${key}` : `-${key}`)
      cmd.push(parsedArgs[key])
    }
  })
  return cmd
}

async function hookForCreateCli() {
  const name = args[1]
  let cmd = regenCmd()
  const mpxBuiltInPreset = await resolvePrompts(name, builtInPreset)
  const cliPreset = await resolvePreset(parsedArgs)
  const mergedPreset = merge(mpxBuiltInPreset, cliPreset)

  cmd.push('-i', JSON.stringify(mergedPreset))
  doVueCli(cmd)
}

// hook for create cli
if (args[0] === 'create') {
  hookForCreateCli()
} else {
  doVueCli(args)
}

function doVueCli(args) {
  execa(
    'node',
    [
      vueCliBinPath,
      ...args
    ],
    {
      stdio: 'inherit'
    }
  )
}
