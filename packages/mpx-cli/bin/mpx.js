#!/usr/bin/env node

const path = require('path')
const execa = require('execa')
const minimist = require('minimist')
const vueCliBinPath = path.resolve(__dirname, '../node_modules/.bin/vue')
const builtInPreset = require('../lib/preset')
const inquirer = require('inquirer')
const prompts = require('../lib/prompts')
const plugins = require('../lib/plugins')

const args = process.argv.slice(2)
const { p, preset, i, inlinePreset } = minimist(args)

// 只有当使用 create 命令且没有提供 preset 的情况下才走 prompt 逻辑
if (args[0] === 'create' && !p && !preset && !i && !inlinePreset) {
  const name = args[1]
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

    // 添加 inlinePreset
    args.splice(1, 0, '-i', JSON.stringify(builtInPreset))
    // 去掉 @vue/cli 创建项目成功后的提示
    args.push('--skipGetStarted')
    doVueCli()
  })
} else {
  doVueCli()
}

function doVueCli() {
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
