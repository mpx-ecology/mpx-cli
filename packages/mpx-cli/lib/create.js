const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const validateProjectName = require('validate-npm-package-name')
const {
  chalk,
  exit,
  error,
  log,
  stopSpinner,
  hasYarn,
  hasPnpm3OrLater
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')
const Creator = require('@vue/cli/lib/Creator')
const ProjectPackageManager = require('@vue/cli/lib/util/ProjectPackageManager')
const { executeCommand } = require('@vue/cli/lib/util/executeCommand')
const loadRemotePreset = require('@vue/cli/lib/util/loadRemotePreset')
const loadLocalPreset = require('@vue/cli/lib/util/loadLocalPreset')
const { getPromptModules } = require('@vue/cli/lib/util/createTools')
const { clearConsole } = require('@vue/cli/lib/util/clearConsole')
const merge = require('lodash.merge')
const prompts = require('./prompts')
const builtInPreset = require('./preset')
const { createRnProject } = require('./createRn')
const MpxCliPromptsKey = 'mpxCliPrompts'
const PnpmShamefullyHoistConfigRegExp = /^shamefully-(hoist|flatten)=.*$/gm

// Vue CLI 对 pnpm 会默认追加 shamefully-hoist 相关安装参数，容易改变依赖解析结构。
// 这里单独接管 pnpm 命令，保留 registry 环境变量处理，同时避免 hoist 配置影响新项目。
function patchPnpmInstallArgs () {
  if (ProjectPackageManager.__mpxNoShamefullyHoist) {
    return
  }
  const originalRunCommand = ProjectPackageManager.prototype.runCommand
  ProjectPackageManager.prototype.runCommand = function (command, args) {
    if (this.bin !== 'pnpm') {
      return originalRunCommand.call(this, command, args)
    }
    const commandArgs = {
      install: ['install', '--reporter', 'silent'],
      add: ['install', '--reporter', 'silent'],
      upgrade: ['update', '--reporter', 'silent'],
      remove: ['uninstall', '--reporter', 'silent']
    }
    const prevNodeEnv = process.env.NODE_ENV
    delete process.env.NODE_ENV
    return this.setRegistryEnvs()
      .then(() => executeCommand(
        this.bin,
        [
          ...commandArgs[command],
          ...(args || [])
        ],
        this.context
      ))
      .finally(() => {
        if (prevNodeEnv) {
          process.env.NODE_ENV = prevNodeEnv
        }
      })
  }
  ProjectPackageManager.__mpxNoShamefullyHoist = true
}

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

// preset 需要以 JSON 形式表达交互问题的展示条件，不能直接传函数。
// 这里支持 all/any/not 组合条件，供 mpxCliPrompts.modify/add 中的 when 使用。
function matchPromptCondition (condition, answers) {
  if (!condition || typeof condition !== 'object' || Array.isArray(condition)) {
    return !!condition
  }
  if (condition.all) {
    return condition.all.every((item) => matchPromptCondition(item, answers))
  }
  if (condition.any) {
    return condition.any.some((item) => matchPromptCondition(item, answers))
  }
  if (condition.not) {
    return !matchPromptCondition(condition.not, answers)
  }
  return Object.keys(condition).every((key) => {
    const expected = condition[key]
    const actual = answers[key]
    return Array.isArray(expected)
      ? expected.includes(actual)
      : actual === expected
  })
}

function createWhenMatcher (when) {
  if (!when || typeof when !== 'object' || Array.isArray(when)) {
    return when
  }
  return (answers) => matchPromptCondition(when, answers)
}

function normalizePrompt (prompt) {
  return {
    ...prompt,
    when: createWhenMatcher(prompt.when)
  }
}

// 允许 preset 通过 mpxCliPrompts 对内置问题做增删改，便于业务模板控制问答流程。
function resolvePromptList (promptList, promptOptions = {}) {
  const list = promptList.map((prompt) => ({ ...prompt }))
  const { remove = [], modify = {}, add = [] } = promptOptions || {}
  remove.forEach((name) => {
    const index = list.findIndex((prompt) => prompt.name === name)
    if (index > -1) {
      list.splice(index, 1)
    }
  })
  Object.keys(modify).forEach((name) => {
    const index = list.findIndex((prompt) => prompt.name === name)
    if (index > -1) {
      list[index] = normalizePrompt({
        ...list[index],
        ...modify[name]
      })
    }
  })
  add.forEach((prompt) => {
    const normalizedPrompt = normalizePrompt(prompt)
    let insertIndex = -1
    if (prompt.before) {
      insertIndex = list.findIndex((item) => item.name === prompt.before)
    } else if (prompt.after) {
      const afterIndex = list.findIndex((item) => item.name === prompt.after)
      insertIndex = afterIndex > -1 ? afterIndex + 1 : -1
    }
    delete normalizedPrompt.before
    delete normalizedPrompt.after
    if (insertIndex > -1) {
      list.splice(insertIndex, 0, normalizedPrompt)
    } else {
      list.push(normalizedPrompt)
    }
  })
  return list
}

function escapeRegExp (str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// pnpm 的 overrides/allowBuilds 放在 pnpm-workspace.yaml 更稳定，避免写在 package.json 后
// 被不同 pnpm 版本或 workspace 场景忽略。
function ensureYamlMapEntries (content, mapName, entries) {
  if (content && !content.endsWith('\n')) {
    content += '\n'
  }
  if (!content.includes(`${mapName}:`)) {
    content += `${content ? '\n' : ''}${mapName}:\n`
  }
  Object.keys(entries).forEach((key) => {
    const value = entries[key]
    const entryRegExp = new RegExp(`^(\\s{2}${escapeRegExp(key)}:\\s*).*$`, 'm')
    if (entryRegExp.test(content)) {
      content = content.replace(entryRegExp, `$1${value}`)
    } else {
      content = content.replace(`${mapName}:\n`, `${mapName}:\n  ${key}: ${value}\n`)
    }
  })
  return content
}

function ensurePnpmWorkspaceSettings (targetDir) {
  const workspacePath = path.resolve(targetDir, 'pnpm-workspace.yaml')
  let content = fs.existsSync(workspacePath) ? fs.readFileSync(workspacePath, 'utf-8') : ''
  content = ensureYamlMapEntries(content, 'overrides', {
    "'@achrinza/node-ipc'": "'npm:node-ipc-compat@1.0.0'"
  })
  content = ensureYamlMapEntries(content, 'allowBuilds', {
    'core-js-pure': true,
    'vue-demi': true
  })
  fs.writeFileSync(workspacePath, content)
}

// pnpm 安装时仍需要继承 create 命令传入的 registry，否则生成项目可能访问默认源。
function ensureNpmrcConfig (targetDir, config) {
  const npmrcPath = path.resolve(targetDir, '.npmrc')
  let content = fs.existsSync(npmrcPath) ? fs.readFileSync(npmrcPath, 'utf-8') : ''
  if (content && !content.endsWith('\n')) {
    content += '\n'
  }
  Object.keys(config).forEach((key) => {
    if (!content.split('\n').some((line) => line.trim().startsWith(`${key}=`))) {
      content += `${key}=${config[key]}\n`
    }
  })
  fs.writeFileSync(npmrcPath, content)
}

// 新项目不再依赖 shamefully-hoist/shamefully-flatten，保留这些配置会掩盖依赖声明问题。
function removePnpmShamefullyHoistConfig (targetDir) {
  const npmrcPath = path.resolve(targetDir, '.npmrc')
  if (!fs.existsSync(npmrcPath)) {
    return
  }
  let content = fs.readFileSync(npmrcPath, 'utf-8')
  content = content.replace(PnpmShamefullyHoistConfigRegExp, '').replace(/\n{3,}/g, '\n\n').trim()
  fs.writeFileSync(npmrcPath, content ? `${content}\n` : '')
}

async function resolvePrompts (promptList) {
  return inquirer.prompt(promptList).then((answers) => answers)
}

async function resolveCliPreset (options) {
  if (options.preset) {
    return resolvePreset(options)
  } else if (options.inlinePreset) {
    try {
      return JSON.parse(options.inlinePreset)
    } catch (error) {
      error(`CLI inline preset is not valid JSON: ${options.inlinePreset}`)
      exit(1)
    }
  }
  return {}
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
  let promptList = prompts
  if (!preset) {
    const cliPreset = await resolveCliPreset(options)
    // 先用 CLI preset 改造问题列表，再开始问答；这样远程/本地 preset 可以控制交互项。
    promptList = resolvePromptList(prompts, cliPreset[MpxCliPromptsKey])
    // 默认回答
    preset = await resolvePrompts(promptList)
    merge(preset, cliPreset)
  }
  delete preset[MpxCliPromptsKey]
  // css preprocessor
  preset.cssPreprocessor = 'stylus'

  // mpx cli 插件
  preset.plugins = Object.assign({}, preset.plugins, builtInPreset.plugins)

  // 合并问答中的preset
  promptList.forEach((v) => {
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
      needRn: preset.needRn,
      name
    })
  })

  const creator = new Creator(name, targetDir, getPromptModules())

  const packageManager =
    options.packageManager ||
    loadOptions().packageManager ||
    (hasYarn() ? 'yarn' : null) ||
    (hasPnpm3OrLater() ? 'pnpm' : 'npm')
  if (packageManager === 'pnpm') {
    patchPnpmInstallArgs()
  }

  // @achrinza/node-ipc 与 Node 23 不兼容，需要映射到修复包 node-ipc-compat@1.0.0。
  // npm 和 pnpm 的 override 配置位置不同，yarn 暂不处理。
  creator.on('creation', ({ event }) => {
    if (event === 'plugins-install' || event === 'deps-install') {
      try {
        const pkgPath = path.resolve(targetDir, 'package.json')
        const pkg = fs.readJsonSync(pkgPath)
        // 根据包管理器类型写入对应的 overrides 配置，yarn无需处理
        if (packageManager === 'pnpm') {
          removePnpmShamefullyHoistConfig(targetDir)
          ensurePnpmWorkspaceSettings(targetDir)
          if (options.registry) {
            ensureNpmrcConfig(targetDir, {
              registry: options.registry
            })
          }
        } else if (packageManager === 'npm') {
          pkg.overrides = {
            '@achrinza/node-ipc': 'npm:node-ipc-compat@1.0.0'
          }
        }
        fs.writeJsonSync(pkgPath, pkg, { spaces: 2 })
      } catch (e) {}
    }
  })

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

  await creator.create({
    ...options,
    preset: undefined,
    inlinePreset: JSON.stringify(preset)
  })

  if (!process.env.VUE_CLI_TEST && preset.needRn) {
    await createRnProject(targetDir, options)
  }
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
