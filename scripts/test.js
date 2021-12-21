const execa = require('execa')
const glob = require('glob')
const path = require('path')
const ora = require('ora')

async function run(project) {
  const cwd = process.cwd()
  const resolvePackages = (p = '') => path.join(cwd, 'packages', p)
  const packages = glob.sync('*', { cwd: resolvePackages() })
  await removeDir(project)
  await execa('node', ['packages/mpx-cli/bin/mpx.js', 'create', project], {
    stdio: 'inherit'
  })
  const projectRoot = path.join(cwd, project)
  const resolveProject = (dir = '') => path.join(projectRoot, dir)
  const installedPackages = glob.sync('*', {
    cwd: resolveProject('node_modules/@mpxjs')
  })
  const spinner = ora({
    text: 'Install local packages...',
    stream: process.stdout
  }).start()
  for (const installedPackage of installedPackages) {
    if (packages.includes(installedPackage)) {
      const absolutePackage = resolvePackages(installedPackage)
      const packagePkg = require(path.join(absolutePackage, 'package.json'))
      const packageName = packagePkg.name
      spinner.text = `install ${packageName}`
      await install(absolutePackage, projectRoot)
      if (installedPackage.startsWith('vue-cli-plugin')) {
        spinner.text = `invoke ${packageName}`
        await invokeVueCliPlugin(packageName, projectRoot)
      }
    }
  }
  spinner.succeed('done')
}

async function removeDir(dir) {
  await execa('rm', ['-rf', dir])
}

async function invokeVueCliPlugin(pluginName, projectRoot) {
  await execa('vue', ['invoke', pluginName], {
    cwd: projectRoot
  })
}

async function install(plugin, projectRoot) {
  await execa('yarn', ['add', plugin], {
    cwd: projectRoot
  })
}

run('test')
