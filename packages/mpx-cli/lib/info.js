const chalk = require('chalk')

module.exports = function () {
  console.log(chalk.bold('\nEnvironment Info:'))
  require('envinfo').run(
    {
      System: ['OS', 'CPU'],
      Binaries: ['Node', 'Yarn', 'npm'],
      Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
      npmPackages: '/**/{typescript,*vue*,@vue/*/,*mpx*,@mpxjs/*/}',
      npmGlobalPackages: ['@vue/cli', '@mpxjs/cli']
    },
    {
      showNotFound: true,
      duplicates: true,
      fullTree: true
    }
  ).then(console.log)
}
