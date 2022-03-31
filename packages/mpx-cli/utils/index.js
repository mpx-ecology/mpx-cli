const execa = require('execa')
const vueCliBinPath = require.resolve('@vue/cli/bin/vue')

module.exports.regenCmd = function regenCmd (parsedArgs) {
  const cmd = [...parsedArgs._, '--skipGetStarted']
  const ignoreKey = ['_', 'p', 'preset', 'i', 'inlinePreset']
  Object.keys(parsedArgs).forEach((key = '') => {
    if (key && !ignoreKey.includes(key)) {
      cmd.push(key.length > 1 ? `--${key}` : `-${key}`)
      cmd.push(parsedArgs[key])
    }
  })
  return cmd
}

module.exports.doVueCli = function doVueCli (args) {
  return execa(
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
