const chalk = require('chalk')

module.exports.WebpackMpErrorPlugin = class WebpackMpErrorPlugin {
  apply (compiler) {
    function WebpackMpErrorPlugin (stats) {
      const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats]
      statsArr.forEach((item) => {
        console.log(chalk.green(item.compilation.name + '打包结果：\n'))
        console.log(
          item.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
            entrypoints: false
          }) + '\n\n'
        )
      })

      if (stats.hasErrors()) {
        const err = new Error(chalk.red('Build failed with errors.\n'))
        process.send && process.send(err)
        return console.error(err)
      }
    }

    if (compiler.hooks) {
      const plugin = { name: 'WebpackMpErrorPlugin' }
      compiler.hooks.done.tap(plugin, WebpackMpErrorPlugin)
    } else {
      compiler.plugin('done', WebpackMpErrorPlugin)
    }
  }
}
