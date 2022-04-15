#!/usr/bin/env node
const program = require('commander')
const { doVueCli } = require('../utils')

program
  .version(`@mpx/cli ${require('../package').version}`)
  .usage('<command> [options]')

program.command('create <app-name>')
  .description('create a new project powered by mpx-cli-service')
  .option(
    '-p, --preset <presetName>',
    'Skip prompts and use saved or remote preset'
  )
  .option('-d, --default', 'Skip prompts and use default preset')
  .option(
    '-i, --inlinePreset <json>',
    'Skip prompts and use inline JSON string as preset'
  )
  .option(
    '-m, --packageManager <command>',
    'Use specified npm client when installing dependencies'
  )
  .option(
    '-r, --registry <url>',
    'Use specified npm registry when installing dependencies (only for npm)'
  )
  .option(
    '-g, --git [message]',
    'Force git initialization with initial commit message'
  )
  .option('-n, --no-git', 'Skip git initialization')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('--merge', 'Merge target directory if it exists')
  .option('-c, --clone', 'Use git clone when fetching remote preset')
  .option('-x, --proxy <proxyUrl>', 'Use specified proxy when creating project')
  .option('-b, --bare', 'Scaffold project without beginner instructions')
  .option('--skipGetStarted', 'Skip displaying "Get started" instructions')
  .action(async () => {
    require('../lib/create')()
  })

program
  .command('add <plugin> [pluginOptions]')
  .description('install a plugin and invoke its generator in an already created project')
  .option('--registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  .allowUnknownOption()
  .action((plugin) => {
    doVueCli(process.argv.slice(2))
  })

program
  .command('invoke <plugin> [pluginOptions]')
  .description('invoke the generator of a plugin in an already created project')
  .option('--registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  .allowUnknownOption()
  .action(() => {
    doVueCli(process.argv.slice(2))
  })

program
  .command('inspect:mp [paths...]')
  .description('inspect the webpack config in a project with mpx-cli-service')
  .option('--mode <mode>')
  .option('--targets <targets>')
  .option('-v --verbose', 'Show full function definitions in output')
  .action((paths, options) => {
    require('../lib/inspect')(paths, options, 'mp')
  })

program
  .command('inspect:web [paths...]')
  .description('inspect the webpack config in a project with mpx-cli-service')
  .option('--mode <mode>')
  .option('--rule <ruleName>', 'inspect a specific module rule')
  .option('--plugin <pluginName>', 'inspect a specific plugin')
  .option('--rules', 'list all module rule names')
  .option('--plugins', 'list all plugin names')
  .option('-v --verbose', 'Show full function definitions in output')
  .action((paths, options) => {
    require('../lib/inspect')(paths, options, 'web')
  })

program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>', 'set option value')
  .option('-d, --delete <path>', 'delete option from config')
  .option('-e, --edit', 'open config with default editor')
  .option('--json', 'outputs JSON result only')
  .action((value, options) => {
    doVueCli(process.argv.slice(2))
  })

program
  .command('info')
  .description('print debugging information about your environment')
  .action((cmd) => {
    require('../lib/info')()
  })

program.parse(process.argv)
